# 聚合的上下限

[视频链接](https://www.bilibili.com/video/BV1yM411d7RU)

## 原版蓝皮书定义

将实体和值对象聚集到聚合中。每个聚合定义了一个边界。为每个聚合选择一个实体作为其根，并通过根来控制所有对边界内对象的访问。外部对象只能持有根的引用；对内部元素的临时引用只能在单个操作中使用。由于根控制了访问，隐刺我们无法绕过它去修改内部元素。这种安排使得我们可以保证在任何状态变化中，聚合本身的不变量，以及聚合中对象的不变量都可以被满足。

但是**原版的定义无法指导建模**

### 原版定义的特点

着重强调了“强一致性”与“不变量”

### 引申问题

对于以下的问题，原版定义是没有给出指导的：

- 到底哪种聚合的划分方式才更合理？
- 按照一致性的强弱来划分吗？哪几个对象的一致性更强？
- 为什么不把所有业务对象都放到一个聚合内？

## 如何设计建模

![聚合](./6-aggregate-boundaries1.png)

### 聚合大小对代码的影响

聚合的下限：**不要破坏封装**
聚合的上限：**不要出现性能问题**

**_突破上限，不能落地；突破下限，聚合沦为贫血模型_**

聚合越小

- 越难实现一致性，需要更多跨聚合的协调
- 封装粒度越小，领域逻辑越多在聚合间实现
- 整存整取开销越少

聚合越大

- 越容易实现一致性
- 封装粒度越小，领域逻辑越多在聚合内实现
- 整存整取性能开销越多

### 整存整取

在停车场的仓储实现中，保存与读取的信息都是整个聚合，而非其中的一部分字段。

```kt
@Component
class ParkingRepositoryImpl(
    private val parkingDao: ParkingDao
): ParkingRepository {
    override fun findByIdOrError(plate: Plate): Parking {
        return parkingDao.findById(plate.value).map {
            ParkingImpl(
                id = plate,
                checkInTime = it.checkInTime,
                lastPlayTime = it.lastPlayTime,
                totalPaid = it.totalPaid
            )
        }.orElse(
            ParkingImpl(
                id = plate,
                checkInTime = null
            )
        )
    }

    override fun save(parking: Parking) {
        if (parking !is ParkingImpl) {
            throw UnsupportedOperationException("不支持的类型: ${parking.javaClass}")
        }
        parkingDao.save(ParkingTable(
            id = parking.id.value,
            checkInTime = parking.checkInTime,
            lastPlayTime = parking.lastPlayTime,
            totalPaid = parking.totalPaid
        ))
    }
}
```

### 高内聚

如在停车场的聚合实现中，checkInTime 是多次复用的，且这个属性并没有暴露给外部的用户。如果拆成了多个聚合，那么这个属性就会被暴露出去。此时，应该斟酌，这种对外暴露的行为是否是有价值的。**通常，在性能与可读性允许的情况下，不对外暴露就可以了。**

```kt
class ParkingImpl(
    val id: Plate,
    var checkInTime: LocalDateTime? = null,
    var lastPlayTime: LocalDateTime? = null,
    var totalPaid: Int = 0
): Parking {
    override fun handle(eventQueue: EventQueue, command: CheckInCommand): Boolean {
        if (inPark()) {
            eventQueue.enqueue(CheckInFailedEvent(id, command.checkInTime))
            return false
        }

        eventQueue.enqueue(CheckedInEvent(id, command.checkInTime))
        this.checkInTime = command.checkInTime
        return true
    }

    override fun handle(eventQueue: EventQueue, command: NotifyPayCommand) {
        if (!inPark()) {
            throw DomainException("车辆不在场，不能付费")
        }

        lastPlayTime = command.payTime
        totalPaid += command.amount

        eventQueue.enqueue(PaidEvent(plate = id, amount = command.amount, payTime = command.payTime))
    }

    override fun handle(eventQueue: EventQueue, command: CheckOutCommand): Boolean {
        if (!inPark()) {
            eventQueue.enqueue(CheckOutFailedEvent(plate = id, time = command.time, message = "车辆不在场"))
            return false
        }

        if (calculateFeeNow(command.time) > 0) {
            return false
        }

        this.checkInTime = null
        this.totalPaid = 0
        this.lastPlayTime= null

        eventQueue.enqueue(CheckedOutEvent(plate = id, time = command.time))
        return true
    }

    override fun calculateFeeNow(now: LocalDateTime): Int {
        val currentCheckInTime = checkInTime ?: throw DomainException("车辆尚未入场")
        val lastPayTimeCurrent = lastPlayTime ?: return feeBetween(currentCheckInTime, now)
        if (totalPaid < feeBetween(currentCheckInTime, lastPayTimeCurrent)) {
            return feeBetween(currentCheckInTime, now) - totalPaid
        }
        if (lastPayTimeCurrent.plusMinutes(15).isAfter(now)) {
            return 0
        }

        return feeBetween(currentCheckInTime, now) - totalPaid
    }

    private fun feeBetween(start: LocalDateTime, end: LocalDateTime): Int {
        return hoursBetween(start, end) * FEE_PER_HOUR
    }

    private fun hoursBetween(start: LocalDateTime, end: LocalDateTime): Int {
        val minutes = Duration.between(start, end).toMinutes()
        val hours = minutes / 60
        return (if (hours * 60 == minutes) hours else hours + 1).toInt()
    }

    fun inPark(): Boolean {
        return checkInTime != null
    }
}
```

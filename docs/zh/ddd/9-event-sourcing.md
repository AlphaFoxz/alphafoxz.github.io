# 事件溯源

[视频链接](https://www.bilibili.com/video/BV1rk4y1Z7Mr)

## 事件溯源-历史

- Martin Forwler 2005 年
  - <https://martinfowler.com/eaaDev/EventSourcing.html>
- 在 DDD 中应用事件溯源
  - 持久化领域事件
  - 通过回溯领域事件重建聚合

## 事件溯源-优缺点

- 优点
  - 模型设计不受存储实现影响
  - 高性能写：持久化都是追加，不修改
  - 伸缩性：聚合读写容易伸缩，进而整个业务系统都容易伸缩
  - 穿越：回溯到过去任意时间点去看业务状态
  - 排障：通过观察领域模型状态的变化过程来排障
  - 大数据集成简单
- 缺点
  - 必须设计出可回溯的模型
  - 必须 CQRS
  - 重建能力需要编码实现

## 事件溯源-实现

- 前提
  - 模型设计达到聚合完备才能可溯源
- 实现
  - 持久化领域事件
  - 仓储的保存功能改成什么都不做，或废弃掉
  - 仓储的查询方法
    - 按 id 查询：查询领域事件，并重建
    - 非按照 id 查询：要提前构建索引，查出 id，再按照 id 查出聚合
  - 快照
    - 聚合事件可能过多，导致重建性能差时使用
    - 每发生过一些事件，保存聚合所有状态到快照中
    - 仓储查询时先找最近的快照，再从快照处重播之后发生的事件

## 事件溯源-案例 1

![案例1](./9-event-sourcing1.png){width=100%}

### 案例 1 数据库设计

#### 不用事件溯源，直接存取聚合状态

| borrow_book_agg       |
| --------------------- |
| \* id: bigint         |
| book_id: text         |
| lost_reported: bool   |
| wait_return: bool     |
| borrow_time: datetime |

```sql
select *
from borrow_book_agg
where
  id = ?
```

#### 用事件溯源，存取领域事件

| borrow_event          |
| --------------------- |
| \* event_id: bigint   |
| event_time: timestamp |
| event_type: text      |
| agg_id: bigint        |
| agg_type: text        |

```sql
select *
from borrow_event
where
  agg_id = ?
  and agg_type = ?
order by
  event_time asc
```

### 代码示例

```kt
class BorrowAggRepositoryImpl(
    private val domainEventsDao: DomainEventsDao
) : BorrowAggRepository {
    override fun findById(id: BorrowId): BorrowAgg? {
      val events = domainEventsDao.findEventsByAggIdAndAggType(id.toString(), "Borrow")
      return if (events.isNotEmpty()) BorrowAggReplayer.replay(events) else null
    }
}

object BorrowAggReplayer {
    fun replay(events: List<DomainEvent>): BorrowAgg {
        val firstEvent = events.getOrNull(0) as? BookBorrowedEvt ?: throw DomainException("第一个事件不是借出书事件")
        val agg = BorrowAgg(
            id = firstEvent.borrowId, bookId = firstEvent.bookId,
            borrowTime = firstEvent.borrowTime, lostReported = false, waitReturn = false
        )

        this.replay(agg, evnets.subList(1, events.size))
        return agg
    }

    fun replay(formAgg: BorrowAgg, events: List<DomainEvent>) {
        event.forEach { event ->
            when (event) {
                is BookReportedLostEvt -> formAgg.lostReported = true
                is BookReturnedEvt -> formAgg.waitReturn = false
            }
        }
    }
}
```

## 事件溯源-案例 2

![案例1](./9-event-sourcing2.png){width=100%}

### 案例 2 数据库设计

| domain_event          |
| --------------------- |
| \* event_id: bigint   |
| event_time: timestamp |
| event_type: text      |
| agg_id: bigint        |
| agg_type: text        |

| agg_snapshot          |
| --------------------- |
| \* event_id: bigint   |
| event_time: timestamp |
| event_type: text      |
| agg_id: bigint        |
| agg_type: text        |
| snapshot: text        |

```sql
select *
from agg_snapshot
where
  agg_id = ?
  and agg_type = ?
order by
  event_time desc
limit 1
```

```sql
select *
from domain_event
where
  agg_id = ?
  and agg_type = ?
  and event_time > ?
order by
  event_time asc
```

注意这里用了事件的顺序性，如果时间精度不够可能有碰撞，可以用整数序列等。

## 关于快照

- 新建快照的时机
  - 定时任务
  - 保存领域事件时
  - 读取聚合时
- 快照策略
  - 快照后领域事件数量达到某个阈值
  - 发生某种事件后
  - 最近 N 次重建事件超过阈值后
  - 距离上次快照时间间隔多久后建立

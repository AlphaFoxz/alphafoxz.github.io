# DDD 的学习方法和路径

[视频链接](https://www.bilibili.com/video/BV1Lj411J7JX)

- 实践是学习 DDD 的唯一方法

DDD = 知识（知不知道） + 技能（反复实践）

## 实践前纠正心态

- **不难**。实践前纠正心态，任何智商正常的程序员都能很快学会！
- **不贵**。相反，DDD 会让研发写作成本更低，更快，更高质量，总成本更低！
- **不疑**。不相信 DDD 的话没必要浪费精力去学，毕竟还有别的方法论可以用。

## 实践路径

<mermaid>
graph LR
实现模型 --> 战术建模
战术建模 --> 战略建模
战略建模 --> 协作
</mermaid>

- 实现模型：会使用六边形架构和 CQRS 实现出领域模块，会仓储模式
- 战术建模：用事件风暴和 OOD 设计模型，掌握聚合，能解决较简单问题
- 战略建模：用事件风暴对复杂业务建模，掌握衔接上下文子领域
- 协作：帮助兄弟团队理解 DDD，统一语言，结合敏捷开发、架构治理等

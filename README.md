### New Context

  - Context的基本用法（HOC，Refs）
      1. 如果没有提供对应消费者(Consumer)的数据提供者(Provider)；消费的值从createContext(defaultValue)defaultValue中提供
      2. 如果有对应的Provider,消费的值就从Provider的value中获取，如果value没有配置属性，则为空
      3. 坑：同时更新 context 和 消费组件的state，state会丢失！！！！根源在于，消费组件是通过一个function返回，所以每次更新context后，都是一个新的消费组件实例！！！
  - 将new Context作简单的全局State用(redux)
  - 为避免多层嵌套，提供多个Context的Compose方法
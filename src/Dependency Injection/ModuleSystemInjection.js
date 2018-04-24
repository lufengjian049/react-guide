/**
 * 去除old context，来定义一个全局的store
 */

 const dependencies = {}

 function register(key,dependency) {
   dependencies[key] = dependency;
 }

 function fetch(key) {
   if(dependencies[key]) {
     return dependencies[key];
   }
   throw new Error(`${key} is not registered as dependency`)
 }

 function wire(Component,deps,mapper) {
    return class Inject extends React.Component {
        constructor(props) {
          super(props);
          this._resolvedDependencies = mapper(...deps.map(fetch));
        }
        render() {
          return (
            <Component 
              {...this.props}
              {...this._resolvedDependencies}
            />
          )
        }
    }
 }

 //使用，通过模块 register 对应的数据，

 //消费组件，通过wire去绑定依赖数据
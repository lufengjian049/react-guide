/**
 * 16.3之前的context 实现依赖注入
 */
import React from 'react';
import PropTypes from 'prop-types';

const dependencies = {
   data: {},
   get(key) {
     return this.data[key];
   },
   register(key,value) {
     this.data[key] = value
   }
 }

 dependencies.register('title','react in title');

 class App extends React.Component {
    getChildContext() {
        return dependencies;
    }
    render() {
        return (
            <Header />
        )
    }
 }
 App.childContextTypes = {
   data: PropTypes.object,
   get: PropTypes.func,
   register: PropTypes.func
 };

 class Header extends React.Component {
    render() {
      return (
        <TItleComponent />
      )
    }
 }

 //title消费值
 function Title({title}) {
   return <h1>{title}</h1>
 }

 const TItleComponent = wire(Title,['title'],(title) => {title})

 //通过HOC将 获取context的定义统一管理，避免重复代码，并且定义依赖，还可以定义一层selector，转为想要的值
 function wire(Component,dependencies,mapper) {
    class Inject extends React.Component {
        render() {
          var resolved = dependencies.map(this.context.get.bind(this.context));
          var props = mapper(...resolved);
          // return React.createElement(Component,props);
          return (
            <Component 
                {...props}
                {...this.props}
            />
          )
        }
    }
    Inject.contextTypes = {
      data: PropTypes.object,
      get: PropTypes.func,
      register: PropTypes.func
    }
    return Inject;
 }
//thunk
//定义：将多参数函数替换为单参数函数，且只接受回调函数作为参数
//多参数，回调在最后一个参数，thunk函数：传入单参数的callback的函数
//thunkify回调函数只执行一次
function thunkify(fn) {
    return function(...args) {
        let called;
        const ctx = this;
        return function(callback) {
            args = [...args,function() {
                if(called) {
                    return;
                }
                called = true;
                callback.apply(null,arguments);
            }];
            try{
                fn.apply(ctx,args);
            }catch(err) {
                callback(err);
            }
        }
    }
}
//延伸：Generator的自执行，yield返回的是一个thunk函数
function run(fn) {
    const gen = fn();
    function next(err,data) {
        const result = gen.next(data);
        if(result.done) return;
        result.value(next);
    }
    next();
}

//redux-thunk
function createThunkMiddleware(extraArgument) {
    return ({ dispatch, getState }) => next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
      }
  
      return next(action);
    };
  }

//中间件中dispatch也是经过enhanced的dispatch
//action types
const GET_DATA = 'GET_DATA',
    GET_DATA_SUCCESS = 'GET_DATA_SUCCESS',
    GET_DATA_FAILED = 'GET_DATA_FAILED';
//action creator
const getDataAction = function(id) {
    return function(dispatch, getState) {
        dispatch({
            type: GET_DATA, 
            payload: id
        })
        api.getData(id) //注：本文所有示例的api.getData都返回promise对象
            .then(response => {
                dispatch({
                    type: GET_DATA_SUCCESS,
                    payload: response
                })
            })
            .catch(error => {
                dispatch({
                    type: GET_DATA_FAILED,
                    payload: error
                })
            }) 
    }
}

//reducer
const reducer = function(oldState, action) {
    switch(action.type) {
    case GET_DATA : 
        return oldState;
    case GET_DATA_SUCCESS : 
        return successState;
    case GET_DATA_FAILED : 
        return errorState;
    }
}
//redux-promise
function isPromise(val) {
  return val && typeof val.then === 'function';
}

function promiseMiddleware(_ref) {
  var dispatch = _ref.dispatch;

  return function (next) {
    return function (action) {
      if (!_fluxStandardAction.isFSA(action)) {
        return isPromise(action) ? action.then(dispatch) : next(action);
      }

      return isPromise(action.payload) ? action.payload.then(function (result) {
        return dispatch(_extends({}, action, { payload: result }));
      }, function (error) {
        return dispatch(_extends({}, action, { payload: error, error: true }));
      }) : next(action);
    };
  };
}

//将payload替换为异步数据或错误信息

//action types
const GET_DATA = 'GET_DATA';

//action creator
const getData = function(id) {
    return {
        type: GET_DATA,
        payload: api.getData(id) //payload为promise对象
    }
}

//reducer
function reducer(oldState, action) {
    switch(action.type) {
      case GET_DATA: 
          if (!action.error) {
              return action.payload
          } else {
                return errorState
          }
    }
}

//action只剩下，actionCreateor定义中一个最终的action，成功和失败还糅合在里面。
//痛点：无法实现 Optimistic update：乐观更新，不等待请求成功，发送请求的同时立即渲染数据。


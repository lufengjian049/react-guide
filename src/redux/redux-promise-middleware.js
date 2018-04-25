/**
 * redux-promise 的温和的渐进方案，在middleware中提供异步接口状态的action
 */

//action types
const GET_DATA = 'GET_DATA',
  GET_DATA_PENDING = 'GET_DATA_PENDING',
  GET_DATA_FULFILLED = 'GET_DATA_FULFILLED',
  GET_DATA_REJECTED = 'GET_DATA_REJECTED';
//action creator
const getData = function (id) {
  return {
    type: GET_DATA,
    payload: {
      promise: api.getData(id),
      data: id
    }
  }
}

//reducer
const reducer = function (oldState, action) {
  switch (action.type) {
    case GET_DATA_PENDING:
      return oldState; // 可通过action.payload.data获取id
    case GET_DATA_FULFILLED:
      return successState;
    case GET_DATA_REJECTED:
      return errorState;
  }
}

//痛点：一个action变成了4个action，可以结合type-to-reducer解决这个问题
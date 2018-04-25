/**
 * redux-action-tools
 * 给出了一整套从action到reducer的解决方案；
 * createAction => 符合FSA规范的action，还包含meta元数据
 * creatAsyncAction => （meta: asyncPhase =[start,success,failed]）
 *    action---主要是结合redux-thunk,dispatch一个function，在function中处理async的3种状态，分别发出对应的action.type
 *    reducer--为了减少actiontype的定义，针对一个动作的type，定义了done，failed方法，绑定对应的处理reducer，再通过build出一个入口reducer
 *    meta--附加值的威力,基于meta作拦截方案(中间件处理)
 *      - 通过createAsyncAction创建的action都有一个附加的meta.asyncPhase标识通用配置，在差异化createAction中传入差异化的meta数据，结合通用配置，可以实现差异化的更新操作
 */
export default function loadingMiddleWare({ dispatch }) {
  return next => (action) => {
    const asyncPhase = _.get(action, 'meta.asyncPhase');
    const omitLoading = _.get(action, 'meta.omitLoading');

    if (asyncPhase && !omitLoading) {
      dispatch({
        type: asyncPhase === ASYNC_PHASES.START
          ? actionTypes.ASYNC_STARTED
          : actionTypes.ASYNC_ENDED,
        payload: {
          source: 'ACTION',
          action,
        },
      });
    }

    return next(action);
  };
}
//默认会走loadingMiddleware去显示loading
export const addTodo = createAsyncAction(types.ADD_TODO, text=> maybe({text}));
//传入meta，该情况却不显示loading，因为没走到dispatch
export const deleteTodo = createAsyncAction(types.DELETE_TODO, id=> maybe({id}), { omitLoading: true })

//以异步请求的失败处理为例，每个项目通常都有一套比较通用的，适合多数场景的处理逻辑，比如弹窗提示。同时在一些特定场景下，又需要绕过通用逻辑进行单独处理，比如表单的异步校验
// 比较完善的错误处理(Loading同理)需要具备如下特点：

// 面向异步动作(action)，而非直接面向请求
// 不侵入业务代码
// 默认使用通用处理逻辑，无需额外代码
// 可以绕过通用逻辑

//处理error也是同样的思路,meta.asyncPhase中提供了FAILED


 //源码实现
 import camelCase from 'camelcase';

const ASYNC_PHASES = {
  START: 'START',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

const identity = id => id;

function createAction (type, payloadCreator, metaCreator) {
  const finalActionCreator = typeof payloadCreator === 'function'
    ? payloadCreator
    : identity;
  return (...args) => {
    const action = {
      type
    };

    if (args[0] !== undefined && args[0] !== null) {
      action.payload = args[0] instanceof Error
        ? args[0]
        : finalActionCreator(...args);
    }

    if (action.payload instanceof Error) {
      action.error = true;
    }

    if (typeof metaCreator === 'function') {
      action.meta = metaCreator(...args);
    }

    return action;
  };
}

function createActions(actionConfigs) {
  const actions = {};
  for (let type in actionConfigs) { //use for-in instead of reduce
    if (Object.prototype.hasOwnProperty.call(actionConfigs, type)) {
      const config = actionConfigs[type];
      const actionName = camelCase(type);

      if (typeof config === 'function') {
        actions[actionName] = createAction(type, config);
      } else {
        const { payload, meta } = config || {};
        actions[actionName] = createAction(type, payload, meta)
      }
    }
  }
  return actions;
}

function getAsyncMeta(metaCreator, payload, asyncPhase) {
  const asyncMetaCreator = typeof metaCreator === 'function'
    ? metaCreator
    : (payload, defaultMeta) => ({...defaultMeta, ...metaCreator});

  return asyncMetaCreator(payload, {asyncPhase});
}

function createAsyncAction(type, payloadCreator, metaCreator) {
  const startAction = createAction(type, identity, (_, meta) => meta);
  const completeAction = createAction(`${type}_${ASYNC_PHASES.COMPLETED}`, identity, (_, meta) => meta);
  const failedAction = createAction(`${type}_${ASYNC_PHASES.FAILED}`, identity, (_, meta) => meta);

  return syncPayload => {
    return (dispatch, getState) => {
      dispatch(
        startAction(syncPayload, getAsyncMeta(metaCreator, syncPayload, ASYNC_PHASES.START))
      );

      const promise = payloadCreator(syncPayload, dispatch, getState);

      invariant(
        isPromise(promise),
        'payloadCreator should return a promise'
      );

      return promise.then(value => {
        dispatch(
          completeAction(value, getAsyncMeta(metaCreator, value, ASYNC_PHASES.COMPLETED))
        );
        return value;
      }, e => {
        dispatch(
          failedAction(e, getAsyncMeta(metaCreator, e, ASYNC_PHASES.FAILED))
        );
        return Promise.reject(e);
      });
    }
  };
}

function isPromise(object) {
  return object && typeof object.then === 'function';
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function ActionHandler() {
  this.currentAction = undefined;
  this.handlers = {};
}

ActionHandler.prototype = {
  when(actionType, handler) {
    if (Array.isArray(actionType)) {
      this.currentAction = undefined;
      actionType.forEach((type) => {
        this.handlers[type] = handler;
      })
    } else {
      this.currentAction = actionType;
      this.handlers[actionType] = handler;
    }
    return this;
  },
  done(handler) {
    this._guardDoneAndFailed();
    this.handlers[`${this.currentAction}_${ASYNC_PHASES.COMPLETED}`] = handler;
    return this;
  },
  failed(handler) {
    this._guardDoneAndFailed();
    this.handlers[`${this.currentAction}_${ASYNC_PHASES.FAILED}`] = handler;
    return this;
  },
  build(initValue = null) {
    return (state = initValue, action) => {
      const handler = action ? this.handlers[action.type] : undefined;

      if (typeof handler === 'function') {
        return handler(state, action);
      }

      return state;
    };
  },
  _guardDoneAndFailed() {
    if (!this.currentAction) {
      throw new Error(
        'Method "done" & "failed" must follow the "when(action, ?handler)", and "action" should not be an array'
      );
    }
  }
};

function createReducer() {
  return new ActionHandler();
}

export {
  createAction,
  createActions,
  createAsyncAction,
  createReducer,
  ASYNC_PHASES
}
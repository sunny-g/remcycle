import { mapObj } from './util';

const reduxSinksReducer = (newReduxSink, reduxSink) =>
  newReduxSink.combine((newReduxSinkObj, reduxSinkObj) => ({
    ...newReduxSinkObj,
    ...mapObj((action$, actionType) => newReduxSinkObj.hasOwnProperty(actionType)
      ? newReduxSinkObj[actionType].merge(action$)
      : action$
    )(reduxSinkObj),
  }), reduxSink);

const reduxSinksCombiner = (...reduxSinks) => reduxSinks.reduce(reduxSinksReducer);

export default reduxSinksCombiner;

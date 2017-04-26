import combineSinks, { SinksCombiner } from '@sunny-g/cycle-utils/es2015/combineSinks';
import { mapObj } from './util';

const reduxSinkReducer = (newReduxSink, reduxSink) =>
  newReduxSink.combine((newReduxSinkObj, reduxSinkObj) => ({
    ...newReduxSinkObj,
    ...mapObj((action$, actionType) => newReduxSinkObj.hasOwnProperty(actionType)
      ? newReduxSinkObj[actionType].merge(action$)
      : action$
    )(reduxSinkObj),
  }), reduxSink);

const reduxSinkCombiner = (...reduxSinks) => reduxSinks.reduce(reduxSinkReducer);

const mergeReduxSinks: SinksCombiner = combineSinks({
  REDUX: reduxSinkCombiner,
});

export { reduxSinkCombiner };
export default mergeReduxSinks;

import { of } from 'most';
import mapSinks from '@sunny-g/cycle-utils/es2015/mapSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { mapObj } from '../util';

const logActions = (sinkLogger, actionLoggers = {}): HigherOrderComponent => mapSinks(
  'REDUX', (REDUX = of({})) => ({
    REDUX: REDUX
      .tap(sinkLogger)
      .map(mapObj((action$, actionType) => actionLoggers.hasOwnProperty(actionType)
        ? action$
          .tap(actionLoggers[actionType])
          .multicast()
        : action$
      )),
  }),
);

export default logActions;

import { of } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { ActionStream } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionStreamCreator {
  (): ActionStream<any>;
}

export interface DefaultActionStreams {
  (adders: { [actionType: string]: ActionStreamCreator }): HigherOrderComponent;
}

const defaultActionStreams: DefaultActionStreams = adders => mapSinksWithSources(
  'REDUX', 'props', (REDUX = of({}), propsSource = of({})) => ({
    REDUX: REDUX
      .map(mapObj((action$, actionType) => !adders.hasOwnProperty(actionType)
        ? action$
        : action$
          .merge(adders[actionType]())
          .multicast()
      )),
  }),
);

export default defaultActionStreams;

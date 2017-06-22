import { of } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionAdder {
  (): Action<any>;
}

export interface DefaultActions {
  (adders: { [actionType: string]: ActionAdder }): HigherOrderComponent;
}

const defaultActions: DefaultActions = adders => mapSinksWithSources(
  'REDUX', 'props', (REDUX = of({}), propsSource = of({})) => ({
    REDUX: REDUX
      .map(mapObj((action$, actionType) => !adders.hasOwnProperty(actionType)
        ? action$
        : action$
          .merge(of(adders[actionType]()))
          .multicast()
      )),
  }),
);

export default defaultActions;

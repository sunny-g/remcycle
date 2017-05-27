import { of, Stream } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionMapper {
  (action: Action<any>, props: {}): Action<any>;
}

export interface MapActions {
  (mappers: { [actionType: string]: ActionMapper }): HigherOrderComponent;
}

const mapActions: MapActions = mappers => mapSinksWithSources(
  'REDUX', 'props', (REDUX = of({}), propsSource = of({})) => ({
    REDUX: REDUX
      .map(mapObj((action$, actionType) => !mappers.hasOwnProperty(actionType)
        ? action$
        : action$
          .sample(mappers[actionType], action$, propsSource)
          .filter(action => action !== undefined)
          .multicast()
      )),
  }),
);

export default mapActions;

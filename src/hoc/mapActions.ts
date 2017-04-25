import { of, Stream } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/dist/es2015/interfaces';
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
      .sample((action$s, props) => {
        return mapObj((action$, actionType) => mappers.hasOwnProperty(actionType) ?
          action$
            .map(action => mappers[actionType](action, props))
            .filter(action => action !== undefined) :
          action$
        )(action$s);
      }, REDUX, propsSource),
  }),
);

export default mapActions;

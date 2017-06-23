import { of, Stream } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionMapper {
  (action: Action<any>, props: {}): Action<any>;
}

export interface WithActions {
  ( mappers: { [actionType: string]: { [actionType: string]: ActionMapper } }
  ): HigherOrderComponent;
}

const withActions: WithActions = mappers => mapSinksWithSources(
  'REDUX', 'props', (REDUX = of({}), propsSource = of({})) => ({
    REDUX: REDUX
      .map(action$s => ({
        ...action$s,
        ...Object
          .keys(mappers)
          .reduce((newAction$s, listenedActionType) => {
            const mapperObj = mappers[listenedActionType];
            const action$ = action$s[listenedActionType];

            return {
              ...newAction$s,
              ...mapObj(actionCreator => {
                return action$
                  .sample(actionCreator, action$, propsSource)
                  .filter(action => action !== undefined)
                  .multicast();
              }, mapperObj),
            };
          }, {}),
      })),
  }),
);

export default withActions;

import { empty, of, merge, Stream } from 'most';
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
            const action$ = action$s[listenedActionType] || empty();

            return {
              ...newAction$s,
              ...mapObj((actionCreator, emittedActionType) => {
                const upstreamCreatedAction$ = merge(
                  action$s[emittedActionType] || empty(),
                  newAction$s[emittedActionType] || empty(),
                );

                return action$
                  .sample((action, props) => {
                    let newAction;

                    try {
                      newAction = actionCreator(action, props);
                    } catch(e) {
                      console.error('error in `withActions`', listenedActionType, 'to', emittedActionType, '`actionCreator`:', e);
                    } finally {
                      return newAction;
                    }
                  }, action$, propsSource)
                  .filter(action => action !== undefined)
                  .merge(upstreamCreatedAction$)
                  .multicast();
              }, mapperObj),
            };
          }, {}),
      })),
  }),
);

export default withActions;

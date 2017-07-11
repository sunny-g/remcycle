import { of, mergeArray } from 'most';
import { hold } from '@most/hold';
import Collection from '@motorcycle/collection';
import compose from 'ramda/src/compose';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/src/interfaces';

export interface collectionStateReducer {
  (state: any, action: Action<any>, props: {}, sources: {}): any;
}

export interface WithCollection {
  ( collectionSourceKey: string,
    initialCollection: any,
    reducers: { [actionType: string]: collectionStateReducer },
  ): HigherOrderComponent;
}

/**
 */
const withCollection: WithCollection = (collectionSourceKey, initialCollection, reducers) =>
  mapSources(
    '*', sources => {
      const { REDUX, props: propsSource = of({}) } = sources;

      const reducer$ = mergeArray(
        Object
          .keys(reducers)
          .map(actionType => {
            const actionReducer = reducers[actionType];
            const action$ = REDUX.action.select(actionType);

            return action$
              .sample((action, props) => collection =>
                actionReducer(collection, action, props, sources),
              action$, propsSource);
          }),
      );

      return {
        [collectionSourceKey]: reducer$
          .scan((collection, reducer: (collection: any) => any) => reducer(collection),
            initialCollection)
          .skipRepeatsWith(Collection.areItemsEqual)
          .thru(hold),
      };
    },
  );

export default withCollection;

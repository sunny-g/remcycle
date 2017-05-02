import { of, merge } from 'most';
import Collection from '@motorcycle/collection';
import compose from 'ramda/src/compose';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/dist/es2015/interfaces';

export interface collectionStateReducer {
  (state: any, action: Action<any>, props: {}, sources: {}): any;
}

export interface WithCollection {
  ( key: string,
    initialCollection: any,
    reducers: { [actionType: string]: collectionStateReducer },
  ): HigherOrderComponent;
}

/**
 */
const withCollection: WithCollection = (key, initialCollection, reducers) => mapSources(
  '*', sources => {
    const { REDUX, props: propsSource = of({}) } = sources;

    const reducer$ = merge(...Object
      .keys(reducers)
      .map(actionType => {
        const action$ = REDUX.action.select(actionType);

        return action$
          .sample((action, props) => state =>
            reducers[actionType](state, action, props, sources),
          action$, propsSource);
      }),
    );

    return {
      [key]: reducer$
        .scan((collection, reducer: (collection: any) => any) =>
          reducer(collection), initialCollection
        )
        .skipRepeatsWith(Collection.areItemsEqual)
        .multicast(),
    };
  },
);

export default withCollection;

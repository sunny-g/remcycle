import compose from 'ramda/src/compose';
import { of, merge, mergeArray } from 'most';
import { hold } from '@most/hold';
import Collection from '@motorcycle/collection';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { Action } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { pick, shallowEquals } from '../util';

export interface CollectionActionReducer {
  (state: any, action: Action<any>, props: {}, sources: {}): any;
}

export interface CollectionPropReducer {
  (state: any, props: {}, sources: {}): any;
}

export interface WithCollection {
  ( collectionSourceKey: string,
    initialCollectionOrCreator: (any | ((sources: {}) => any)),
    actionReducers: { [actionType: string]: CollectionActionReducer },
    propReducers: { [propType: string]: CollectionPropReducer },
  ): HigherOrderComponent;
}

/**
 */
const withCollection: WithCollection = (collectionSourceKey, initialCollectionOrCreator, actionReducers = {}, propReducers = {}) =>
  mapSources(
    '*', sources => {
      const { REDUX, props: propsSource = of({}) } = sources;

      const watchedPropReducer$ = mergeArray(
        Object
          .keys(propReducers)
          .map(_watchedPropsNames => {
            const propReducer = propReducers[_watchedPropsNames];
            const watchedPropsNames = _watchedPropsNames.split(',');
            const watchedProps$ = propsSource
              .map(pick(watchedPropsNames))
              .skipRepeatsWith(shallowEquals)
              .constant(null);

            return watchedProps$
              .sample((_, props) => collection =>
                propReducer(collection, props, sources),
              watchedProps$, propsSource);
          }),
      );

      const actionReducer$ = mergeArray(
        Object
          .keys(actionReducers)
          .map(actionType => {
            const actionReducer = actionReducers[actionType];
            const action$ = REDUX.action.select(actionType);

            return action$
              .sample((action, props) => collection =>
                actionReducer(collection, action, props, sources),
              action$, propsSource);
          }),
      );

      const reducer$ = merge(
        watchedPropReducer$,
        actionReducer$,
      );

      const state$ = (typeof initialCollectionOrCreator === 'function')
        ? ((function() {
          const defaultCollection = Symbol('=== default withCollection collection ===');
          const initialCollectionReducer$ = initialCollectionOrCreator(sources)
            .map(collection => _ => collection);

          return initialCollectionReducer$
            .merge(reducer$)
            .scan((collection, reducer: (collection: any) => any) =>
              reducer(collection),
            defaultCollection)
            .filter(collection => collection !== defaultCollection);
        })())
        : reducer$.scan((collection, reducer: (collection: any) => any) =>
            reducer(collection),
          initialCollectionOrCreator);

      return {
        [collectionSourceKey]: state$
          .skipRepeatsWith(Collection.areItemsEqual)
          .thru(hold),
      };
    },
  );

export default withCollection;

import { of, merge, mergeArray } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { pick, shallowEquals } from '../util';

export interface WithState {
  ( propName: string,
    initialState: any,
    actionReducers: { [type: string]: (state: any, action: any, props: any) => any; },
    propReducers: { [propNames: string]: (state: any, props: any) => any; },
  ): HigherOrderComponent;
}

const withState: WithState = (propName, initialState, actionReducers, propReducers = {}) =>
  mapSources(
    [ 'REDUX', 'props' ],
    (REDUX, propsSource = of({})) => {
      // TODO: pass through if:
        // ? this was distinct from before
        // ? when every other prop was the same as before AND this one was different
      const overwriteReducer$ = propsSource
        .map(props => props[propName])
        .filter(prop => prop !== undefined)
        .skipRepeatsWith(shallowEquals)
        .map(prop => state => prop);

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
              .sample(props =>
                state => propReducer(state, props),
              propsSource);
          }),
      );

      const actionReducer$ = mergeArray(
        Object
          .keys(actionReducers)
          .map(actionType => {
            const actionReducer = actionReducers[actionType];
            const action$ = REDUX.action.select(actionType);

            return action$
              .sample((action, props) =>
                state => actionReducer(state, action, props),
              action$, propsSource);
          }),
      );

      const reducer$ = merge(
        overwriteReducer$,
        watchedPropReducer$,
        actionReducer$,
      );

      const state$ = (typeof initialState === 'function')
        ? (function() {
          const defaultState = Symbol('=== default withState state ===');
          const initialStateReducer$ = propsSource
            .take(1)
            .map(props => _ => initialState(props));

          return initialStateReducer$
            .concat(reducer$)
            .scan((state, reducer: (any: any) => any) => reducer(state), defaultState)
            .filter(state => state !== defaultState);
        })()
        : reducer$
          .scan((state, reducer: (any: any) => any) => reducer(state), initialState);

      const props$ = propsSource
        .combine((props, state) => ({ ...props, [propName]: state }), state$)
        .skipRepeatsWith(shallowEquals)
        .thru(hold);

      return { props: props$ };
    },
  );

export default withState;

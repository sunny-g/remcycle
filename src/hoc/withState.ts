import { of, merge } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { pick, shallowEquals } from '../util';

export interface WithState {
  ( propName: string,
    initialState: any,
    reducers: { [type: string]: (state: any, action: any, props: any) => any; }
  ): HigherOrderComponent;
}

const withState: WithState = (propName, initialState, reducers) => mapSources(
  [ 'REDUX', 'props' ],
  (REDUX, propsSource = of({})) => {
    // pass through if:
      // this was distinct from before
    // pass through only when every other prop was the same as before AND this one was different
      // aka, skip if `isComplete` is the same AND
    const propReducer$ = propsSource
      .map(props => props[propName])
      .filter(prop => prop !== undefined)
      .skipRepeatsWith(shallowEquals)
      .map(prop => state => prop);

    const reducer$ = merge(
      propReducer$,
      ...Object
        .keys(reducers)
        .map(actionType => {
          const action$ = REDUX.action.select(actionType);

          return action$
            .sample((action, props) =>
              state => reducers[actionType](state, action, props),
            action$, propsSource);
        }),
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

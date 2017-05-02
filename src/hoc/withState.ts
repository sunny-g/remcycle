import { of, merge } from 'most';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { shallowEquals } from '../util';

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

    const state$ = reducer$
      .scan((state, reducer: (any) => any) => reducer(state), initialState);

    const props$ = propsSource
      .combine((props, state) => ({ ...props, [propName]: state }), state$)
      .skipRepeatsWith(shallowEquals);

    return { props: props$ };
  },
);

export default withState;

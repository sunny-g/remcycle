import { from, of } from 'most';
import { hold } from '@most/hold';
import mapSourcesAndSinks from '@sunny-g/cycle-utils/es2015/mapSourcesAndSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { mapObj, shallowEquals } from '../util'

export interface ActionDescription {
  type: string;
  hold?: boolean;
  actionCreator?: (props: any, ...events: any[]) => any;
  actionStreamCreator?: (sources: any, event$: any) => any;
}

export interface Handlers {
  [handlerName: string]: ActionDescription;
}

export interface AddActionHandlers {
  (handlers: Handlers): HigherOrderComponent;
}

const addActionHandlers: AddActionHandlers = (handlers = {}) => mapSourcesAndSinks(
  [ 'REACT', 'props' ], (REACT, propsSource = of({})) => {
    const propHandlers = mapObj((actionDescription, handlerName) =>
      REACT.handler(handlerName, actionDescription['hold'])
    )(handlers);
    return {
      props: propsSource
        .map(props => ({ ...props, ...propHandlers }))
        .skipRepeatsWith(shallowEquals)
        .thru(hold),
    };
  },
  'REDUX', (REDUX, sources) => {
    const { REACT, props: propsSource = of({}) } = sources;

    const actionStreams = Object
      .keys(handlers)
      .reduce((action$s, handlerName) => {
        const actionDescription = handlers[handlerName];
        const {
          type: actionType,
          hold: shouldHold,
          actionCreator,
          actionStreamCreator,
        } = actionDescription;

        const event$ = from(REACT.event(handlerName, shouldHold));
        const action$ = (typeof actionStreamCreator === 'function')
          ? actionStreamCreator(sources, event$)
          : event$
            .sample((eventArgs, props) =>
              actionCreator(props, ...([].concat(eventArgs))),
              event$, propsSource
            )
            .filter(action => action !== undefined)
            .thru(action$ => shouldHold ? action$.thru(hold) : action$.multicast());

        return { ...action$s, [actionType]: action$ };
      }, {});

    return { REDUX: of(actionStreams) };
  },
);

export default addActionHandlers;

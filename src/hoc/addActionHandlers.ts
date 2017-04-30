import { from, of } from 'most';
import mapSourcesAndSinks from '@sunny-g/cycle-utils/es2015/mapSourcesAndSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { mapObj } from '../util'

export interface ActionDescription {
  hold: boolean,
  type: string;
  actionCreator?: (props: any, ...events: any[]) => any;
  actionCreatorStream?: (sources: any, event$: any) => any;
}

export interface Handlers {
  [handlerName: string]: ActionDescription;
}

export interface AddActionHandlers {
  (handlers: Handlers): HigherOrderComponent;
}

const addActionHandlers: AddActionHandlers = (handlers = {}) => mapSourcesAndSinks(
  '*', ({ REACT, props: propsSource = of({}) }) => {
    const createReactHandlers = mapObj((actionDescription, handlerName) =>
      REACT.handler(handlerName, actionDescription['hold'])
    );
    return {
      props: propsSource
        .map(props => ({
          ...props,
          ...createReactHandlers(handlers),
        })),
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
          actionCreatorStream,
        } = actionDescription;

        const event$ = from(REACT.event(handlerName, shouldHold));
        const action$ = (actionCreatorStream !== undefined)
          ? actionCreatorStream(sources, event$)
          : event$
            .sample((eventArgs, props) =>
              actionCreator(props, ...([].concat(eventArgs))),
            event$, propsSource)
            .filter(action => action !== undefined)
            .multicast();

        return {
          ...action$s,
          [actionType]: action$,
        };
      }, {});

    return { REDUX: of(actionStreams) };
  },
);

export default addActionHandlers;

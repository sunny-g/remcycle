import { from, of } from 'most';
import mapSourcesAndSinks from '@sunny-g/cycle-utils/es2015/mapSourcesAndSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { mapObj } from '../util'

export interface ActionDescription {
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
    const createReactHandlers = mapObj((_, handlerName) => REACT.handler(handlerName));

    const props$ = propsSource
      .map(props => ({
        ...props,
        ...createReactHandlers(handlers),
      }));

    return { props: props$ };
  },
  'REDUX', (REDUX, sources) => {
    const { REACT, props: propsSource = of({}) } = sources;
    const actionStreams = Object
      .keys(handlers)
      .reduce((action$s, handlerName) => {
        const event$ = from(REACT.event(handlerName));

        const actionDescription = handlers[handlerName];
        const action$ = actionDescription.hasOwnProperty('actionCreatorStream')
          ? actionDescription['actionCreatorStream'](sources, event$)
          : event$
            .sample((eventArgs, props) => (
              actionDescription['actionCreator'](props, ...([].concat(eventArgs)))
            ), event$, propsSource)
            .filter(action => action !== undefined)
            .multicast();

        return {
          ...action$s,
          [actionDescription['type']]: action$,
        };
      }, {});

    return { REDUX: of(actionStreams) };
  },
);

export default addActionHandlers;

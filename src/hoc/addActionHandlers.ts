import { from, of } from 'most';
import { hold } from '@most/hold';
import mapSourcesAndSinks from '@sunny-g/cycle-utils/es2015/mapSourcesAndSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import reduxSinksCombiner from '../reduxSinksCombiner';
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

const sourceNames = ['REACT', 'props'];
const sinkNames = ['REDUX'];

const createSourcesMapper = handlers => (REACT, propsSource = of({})) => {
  const propHandlers = mapObj(
    (actionDescription, handlerName) =>
      REACT.handler(handlerName, actionDescription['hold']),
    handlers);
  return {
    props: propsSource
      .map(props => ({ ...props, ...propHandlers }))
      .skipRepeatsWith(shallowEquals)
      .thru(hold),
  };
};

const createSinksMapper = handlers => (REDUX = of({}), sources) => {
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
      const newAction$ = (typeof actionStreamCreator === 'function')
        ? actionStreamCreator(sources, event$)
        : event$
          .sample((eventArgs, props) => {
            let action;

            try {
              action = actionCreator(props, eventArgs);
            } catch(e) {
              console.error('error in `addActionHandlers`', handlerName, '`actionCreator`:', e);
            } finally {
              return action;
            }
          }, event$, propsSource)
          .filter(action => action !== undefined);

      const mergedAction$ = (action$s.hasOwnProperty(actionType)
          ? action$s[actionType].merge(newAction$)
          : newAction$
        )
        .thru(action$ => shouldHold ? action$.thru(hold) : action$.multicast());

      return { ...action$s, [actionType]: mergedAction$ };
    }, {});

  return { REDUX: reduxSinksCombiner(REDUX, of(actionStreams)) };
};

const addActionHandlers: AddActionHandlers = (handlers = {}) => {
  const sourcesMapper = createSourcesMapper(handlers);
  const sinksMapper = createSinksMapper(handlers);
  return mapSourcesAndSinks(sourceNames, sourcesMapper, sinkNames, sinksMapper);
}

export default addActionHandlers;

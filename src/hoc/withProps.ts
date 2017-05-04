import { of, combineArray } from 'most';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { shallowEquals } from '../util';

const nullFn = (...args) => null;

// TODO: use function overloading
export interface WithProps {
  ( namesOrPropsOrCreator: {} | ((props: {}) => {}) | string | string[],
    propsCreator?: ((props: {}) => {}),
  ): HigherOrderComponent;
}

/**
 */
const withProps: WithProps = (namesOrPropsOrCreator, propsCreator) => mapSources(
  'props', (propsSource = of({})) => {
    const isFunction = (typeof namesOrPropsOrCreator === 'function');
    const isProps = (namesOrPropsOrCreator !== null
      && !Array.isArray(namesOrPropsOrCreator)
      && typeof namesOrPropsOrCreator === 'object');

    if (isFunction || isProps) {
      return {
        props: propsSource.map(props => ({
          ...props,
          ...(isFunction ? (namesOrPropsOrCreator as ({}) => {})(props) : namesOrPropsOrCreator),
        })),
      };
    }

    const watchedPropsStreams = []
      .concat(namesOrPropsOrCreator)
      .map(propName => propsSource
        .map(props => props[propName])
        .filter(prop => prop !== undefined)
        .skipRepeatsWith(shallowEquals)
      );

    if (watchedPropsStreams.length === 0) {
      return {
        props: propsSource
          .map(propsCreator)
          .skipRepeatsWith(shallowEquals)
      };
    }

    const watchedProps$ = combineArray(nullFn, watchedPropsStreams);
    const mappedProps$ = watchedProps$.sample(propsCreator, propsSource, watchedProps$);

    return {
      props: propsSource
        .sample((props, mappedProps) => ({
          ...props,
          ...mappedProps,
        }), propsSource, mappedProps$)
        .skipRepeatsWith(shallowEquals),
    };
  },
);

export default withProps;

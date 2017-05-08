import { of, mergeArray } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { pick, shallowEquals } from '../util';

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
    const isPropCreatorFunction = (
      propsCreator === undefined && typeof namesOrPropsOrCreator === 'function'
    );
    const isProps = (
      propsCreator === undefined
      && namesOrPropsOrCreator !== null
      && !Array.isArray(namesOrPropsOrCreator)
      && typeof namesOrPropsOrCreator === 'object'
    );

    // propCreator function or props to merge
    if (isPropCreatorFunction || isProps) {
      return {
        props: propsSource
          .map(props => ({
            ...props,
            ...(isPropCreatorFunction
              ? (namesOrPropsOrCreator as ({}) => {})(props)
              : namesOrPropsOrCreator
            ),
          }))
          .skipRepeatsWith(shallowEquals)
          .thru(hold),
      };
    }

    // props to watch + a props creator function
    const watchedPropNames = [].concat(namesOrPropsOrCreator);
    if (watchedPropNames.length === 0) {
      throw new Error('`withProps`: Define prop names to watch, or only define the `propsCreator`');
    }

    const watchedProps$ = propsSource
      .map(props => pick(watchedPropNames, props))
      .skipRepeatsWith(shallowEquals)
      .map(_ => null);

    const mappedProps$ = watchedProps$
      .sample((_, props) => propsCreator(props), watchedProps$, propsSource)
      .map(mappedProps => mappedProps !== undefined ? mappedProps : {})
      .skipRepeatsWith(shallowEquals);

    return {
      props: propsSource
        .sample((props, mappedProps) => ({
          ...props, ...mappedProps,
        }), propsSource, mappedProps$)
        .skipRepeatsWith(shallowEquals)
        .thru(hold),
    };
  },
);

export default withProps;

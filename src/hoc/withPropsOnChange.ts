import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import mapPropsStream from './mapPropsStream';
import { pick, shallowEquals } from '../util';

// TODO: use function overloading
export interface WithPropsOnChange {
  ( namesOrPredicate: string | string[] | ((currProps: {}, prevProps: {}) => boolean),
    propsCreator: ((props: {}) => {}),
  ): HigherOrderComponent;
}

/**
 */
const withPropsOnChange: WithPropsOnChange = (namesOrPredicate, propsCreator) =>
  mapPropsStream(propsSource => {
    const watchedProps$ = (function() {
      if (typeof namesOrPredicate === 'function') {
        return propsSource
          .skipRepeatsWith((prevProps, currProps) => {
            let shouldCreateProps = true;

            try {
              shouldCreateProps = namesOrPredicate(currProps, prevProps);
            } catch(e) {
              console.error('error in `withPropsOnChange` `predicate`:', e);
            } finally {
              const shouldSkipRepeats = !shouldCreateProps;
              return shouldSkipRepeats;
            }
          });
      }

      // props to watch + a props creator function
      const watchedPropNames = [].concat(namesOrPredicate);
      if (watchedPropNames.length === 0) {
        throw new Error('`withPropsOnChange`: Must define prop names to watch or a predicate function');
      }

      return propsSource
        .map(pick(watchedPropNames))
        .skipRepeatsWith(shallowEquals)
        .constant(null);
    })();

    const mappedProps$ = watchedProps$
      .sample((_, props) => {
        let newProps = props;

        try {
          newProps = propsCreator(props);
        } catch(e) {
          console.error('error in `withPropsOnChange` `watchedPropsCreator`:', e);
        } finally {
          return newProps;
        }
      }, watchedProps$, propsSource)
      .map(mappedProps => {
        return (mappedProps !== undefined && mappedProps !== null) ? mappedProps : {}
      })
      .skipRepeatsWith(shallowEquals);

    return propsSource
      .sample((props, mappedProps) => ({
        ...props, ...mappedProps,
      }), propsSource, mappedProps$);
  });

export default withPropsOnChange;

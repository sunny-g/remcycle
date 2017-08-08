import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import withProps from './withProps';
import withPropsOnChange from './withPropsOnChange';

export interface DoOnPropsChange {
  ( namesOrPredicateOrCallback: string | string[] | ((props: {}) => boolean) | ((props: {}) => void),
    callback?: ((props: {}) => void),
  ): HigherOrderComponent;
}

const doOnPropsChange = (namesOrPredicateOrCallback, callback) => {
  return (callback === undefined)
    ? withProps(namesOrPredicateOrCallback)
    : withPropsOnChange(namesOrPredicateOrCallback, callback);
};

export default doOnPropsChange;

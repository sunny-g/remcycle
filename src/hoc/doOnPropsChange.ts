import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import withPropsOnChange from './withPropsOnChange';

export interface DoOnPropsChange {
  ( namesOrPredicate: string | string[] | ((props: {}) => boolean),
    callback: ((props: {}) => void),
  ): HigherOrderComponent;
}

const doOnPropsChange = (namesOrPredicate, callback) =>
  withPropsOnChange(namesOrPredicate, callback);

export default doOnPropsChange;

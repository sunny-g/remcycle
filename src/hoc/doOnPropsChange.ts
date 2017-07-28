import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import withProps from './withProps';

export interface DoOnPropsChange {
  ( watchedPropsNames: string | string[],
    callback: ((props: {}) => void),
  ): HigherOrderComponent;
}

const doOnPropsChange = (watchedPropsNames, callback) =>
  withProps(watchedPropsNames, callback);

export default doOnPropsChange;

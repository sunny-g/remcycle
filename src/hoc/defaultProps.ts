import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import mapProps from './mapProps';
import { mapObj } from '../util';

export interface DefaultProps {
  (defaultProps: {}): HigherOrderComponent;
}

const defaultProps: DefaultProps = (defaultProps = {}) =>
  mapProps(props => ({
    ...defaultProps,
    ...props,
  }));

export default defaultProps;

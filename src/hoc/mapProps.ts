import { of } from 'most';
import { hold } from '@most/hold';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import mapPropsStream from './mapPropsStream';
import { shallowEquals } from '../util';

export interface MapProps {
  (mapper: ((props: {}) => {})): HigherOrderComponent;
}

const mapProps: MapProps = (mapper) =>
  mapPropsStream(props$ => props$.map(mapper));

export default mapProps;

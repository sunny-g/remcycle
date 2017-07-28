import { of } from 'most';
import { hold } from '@most/hold';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import mapPropsStream from './mapPropsStream';
import { shallowEquals } from '../util';

export interface MapProps {
  (mapper: ((props: {}) => {})): HigherOrderComponent;
}

const mapProps: MapProps = (mapper) =>
  mapPropsStream(props$ => props$.map(props => {
    let newProps = props;

    try {
      newProps = mapper(props);
    } catch(e) {
      console.error('error in `mapProps` mapper:', e);
    } finally {
      return newProps;
    }
  }));

export default mapProps;

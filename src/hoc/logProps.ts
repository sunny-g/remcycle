import { of } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import mapPropsStream from './mapPropsStream';

const logProps = (logger): HigherOrderComponent =>
  mapPropsStream(propsSource => propsSource.tap(logger))

export default logProps;

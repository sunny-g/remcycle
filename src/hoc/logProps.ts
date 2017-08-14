import { of } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import mapPropsStream from './mapPropsStream';

const logProps = (logger): HigherOrderComponent =>
  mapPropsStream(propsSource => propsSource.skipRepeatsWith((prevProps, currProps) => {
    try {
      logger(currProps, prevProps);
    } catch(e) {
      console.error('error in `logProps` `logger`:', e);
    } finally {
      return false;
    }
  }));

export default logProps;

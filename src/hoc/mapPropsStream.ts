import { of, Stream } from 'most';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { shallowEquals } from '../util';

export interface MapPropsStream {
  (mapper: ((props: Stream<any>) => Stream<any>)): HigherOrderComponent;
}

const mapPropsStream: MapPropsStream = (mapper) => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource
      .thru(mapper)
      .skipRepeatsWith(shallowEquals),
  }),
);

export default mapPropsStream;

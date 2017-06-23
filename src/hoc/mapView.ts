import { of } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { shallowEquals } from '../util';

export interface MapView {
  (mapper: ((vtree: any) => any)): HigherOrderComponent;
}

// TODO: combine with current propsSource
const mapView: MapView = (mapper) => mapSinksWithSources(
  'REACT', 'props', (reactSink, propsSource = of({})) => ({
    REACT: propsSource
      .skipRepeatsWith(shallowEquals)
      .combine(mapper, reactSink)
      .skipRepeatsWith(shallowEquals),
  }),
);

export default mapView;

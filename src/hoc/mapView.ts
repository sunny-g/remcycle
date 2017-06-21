import mapSinks from '@sunny-g/cycle-utils/es2015/mapSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { shallowEquals } from '../util';

export interface MapView {
  (mapper: ((vtree: any) => any)): HigherOrderComponent;
}

// TODO: combine with current propsSource
const mapView: MapView = (mapper) => mapSinks(
  'REACT', reactSink => ({
    REACT: reactSink
      .map(mapper)
      .skipRepeatsWith(shallowEquals),
  }),
);

export default mapView;

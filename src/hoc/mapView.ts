import { of } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { pick, shallowEquals } from '../util';

export interface MapView {
  ( mapper: ((vtree: any) => any),
    propsToPluck?: string | [string],
  ): HigherOrderComponent;
}

// TODO: combine with current propsSource
const mapView: MapView = (mapper, propsToPluck = '*') => mapSinksWithSources(
  'REACT', 'props', (reactSink, propsSource = of({})) => ({
    REACT: propsSource
      .map(props => propsToPluck === '*' ? props : pick(propsToPluck, props))
      .skipRepeatsWith(shallowEquals)
      .combine(mapper, reactSink)
      .skipRepeatsWith(shallowEquals),
  }),
);

export default mapView;

import { of } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { shallowEquals } from '../util';

export interface MapProps {
  (mapper: ((props: {}) => {})): HigherOrderComponent;
}

const mapProps: MapProps = (mapper) => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource
      .map(mapper)
      .skipRepeatsWith(shallowEquals)
      .thru(hold),
  }),
);

export default mapProps;

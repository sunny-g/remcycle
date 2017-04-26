import { of } from 'most';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import { shallowEquals } from '../util';

export interface MapProps {
  (mapper: ((props: {}) => {})): HigherOrderComponent;
}

const mapProps: MapProps = (mapper) => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource
      .map(mapper)
      .skipRepeatsWith(shallowEquals),
  }),
);

export default mapProps;

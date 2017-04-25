import { of } from 'most';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';

export interface MapProps {
  (mapper: ((props: {}) => {})): {};
}

const mapProps: MapProps = (mapper): HigherOrderComponent => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource.map(mapper),
  }),
);

export default mapProps;

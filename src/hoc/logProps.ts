import { of } from 'most';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';

const logProps = (logger): HigherOrderComponent => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource.tap(logger),
  }),
);

export default logProps;

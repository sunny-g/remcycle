import { of } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';

const logProps = (logger): HigherOrderComponent => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource
      .tap(logger)
      .thru(hold),
  }),
);

export default logProps;

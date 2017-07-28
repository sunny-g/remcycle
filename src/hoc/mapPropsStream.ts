import { of, Stream } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { shallowEquals } from '../util';

export interface MapPropsStream {
  (mapper: ((props: Stream<any>) => Stream<any>)): HigherOrderComponent;
}

const mapPropsStream: MapPropsStream = (mapper) => mapSources(
  'props', (propsSource = of({})) => ({
    props: propsSource
      .thru(props$ => {
        let newProps$ = props$;

        try {
          newProps$ = mapper(props$);
        } catch(e) {
          console.error('error in `mapPropsStream` mapper', e);
        } finally {
          return newProps$;
        }
      })
      .skipRepeatsWith(shallowEquals)
      .thru(hold),
  }),
);

export default mapPropsStream;

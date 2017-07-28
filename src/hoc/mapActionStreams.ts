import { of, Stream } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { ActionStream } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionStreamMapper {
  (action$: ActionStream<any>, sources: any): ActionStream<any>;
}

export interface MapActionStreams {
  (mappers: { [actionType: string]: ActionStreamMapper }): HigherOrderComponent;
}

const mapActionStreams: MapActionStreams = mappers => mapSinksWithSources(
  'REDUX', '*', (REDUX = of({}), sources) => ({
    REDUX: REDUX
      .map(action$s => ({
        ...action$s,
        ...mapObj((actionMapper, actionType) => {
          let newAction$ = action$s[actionType];

          try {
            newAction$ = actionMapper(newAction$, sources);
          } catch(e) {
            console.error('error in `mapActionStreams`', actionType, 'mapper:', e);
          } finally {
            return newAction$;
          }
        }, mappers),
      })),
  }),
);

export default mapActionStreams;

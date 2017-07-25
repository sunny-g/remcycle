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
        ...mapObj((actionMapper, actionType) => (
          actionMapper(action$s[actionType], sources)
        ), mappers),
      })),
  }),
);

export default mapActionStreams;

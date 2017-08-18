import { empty, of, merge, Stream } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { ActionStream } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionStreamCreator {
  (sources: {}): ActionStream<any>;
}

export interface MapSourcesToActionStreams {
  ( mappers: { [actionType: string]: ActionStreamCreator }
  ): HigherOrderComponent;
}

const mapSourcesToActionStreams: MapSourcesToActionStreams = mappers => mapSinksWithSources(
  'REDUX', '*', (REDUX = of({}), sources) => ({
    REDUX: REDUX
      .map(action$s => ({
        ...action$s,
        ...mapObj((actionStreamCreator, emittedActionType) => {
          return merge(
            action$s[emittedActionType] || empty(),
            actionStreamCreator(sources),
          );
        }, mappers),
      })),
  }),
);

export default mapSourcesToActionStreams;

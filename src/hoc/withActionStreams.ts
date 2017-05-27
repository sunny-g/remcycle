import { of, Stream } from 'most';
import mapSinksWithSources from '@sunny-g/cycle-utils/es2015/mapSinksWithSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import { ActionStream } from '@sunny-g/cycle-redux-driver/src/interfaces';
import { mapObj } from '../util';

export interface ActionStreamCreator {
  (action$: ActionStream<any>, sources: any): ActionStream<any>;
}

export interface WithActionStreams {
  ( mappers: { [actionType: string]: { [actionType: string]: ActionStreamCreator } }
  ): HigherOrderComponent;
}

const withActionStreams: WithActionStreams = mappers => mapSinksWithSources(
  'REDUX', '*', (REDUX = of({}), sources) => ({
    REDUX: REDUX
      .map(action$s => ({
        ...action$s,
        ...Object
          .keys(mappers)
          .reduce((newAction$s, listenedActionType) => {
            const mapperObj = mappers[listenedActionType];
            const action$ = action$s[listenedActionType];

            return {
              ...newAction$s,
              ...mapObj(actionStreamCreator => {
                return actionStreamCreator(action$, sources)
              })(mapperObj),
            };
          }, {}),
      })),
  }),
);

export default withActionStreams;

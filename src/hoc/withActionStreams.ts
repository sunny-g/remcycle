import { empty, of, merge, Stream } from 'most';
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
            const action$ = action$s[listenedActionType] || empty();

            if (action$s[listenedActionType] === undefined) {
              console.error('error in `withActionStreams`:', `\`${listenedActionType}\``, 'stream does not exist');
            }

            return {
              ...newAction$s,
              ...mapObj((actionStreamCreator, emittedActionType) => {
                const upstreamCreatedAction$ = merge(
                  action$s[emittedActionType] || empty(),
                  newAction$s[emittedActionType] || empty(),
                );

                let newAction$ = empty();

                try {
                  newAction$ = actionStreamCreator(action$, sources);
                } catch(e) {
                  console.error('error in `withActions`', listenedActionType, 'to', emittedActionType, '`actionStreamCreator`:', e);
                } finally {
                  return merge(upstreamCreatedAction$, newAction$);
                }
              }, mapperObj),
            };
          }, {}),
      })),
  }),
);

export default withActionStreams;

/* global describe, expect, test */

import { of } from 'most';
import withActionStreams from '../../src/hoc/withActionStreams';

const makeActionCreator = type => payload => ({ type, payload, error: false, meta: {} });

const TYPE1 = 'test/type1';
const TYPE2 = 'test/type2';
const TYPE3 = 'test/type3';
const type1 = makeActionCreator(TYPE1);
const type2 = makeActionCreator(TYPE2);
const type3 = makeActionCreator(TYPE3);

function main() {
  return {
    REDUX: of({
      [TYPE1]: of(type1(true)),
    }),
  };
}

describe('withActionStreams HOC', () => {

  test('should emit actions transformed by specific mapper', done => {
    const Main = withActionStreams({
      [TYPE1]: {
        [TYPE2]: action$ => action$.map(action => type2(!action.payload))
      },
    })(main);

    const sinks = Main();

    const redux$ = sinks.REDUX
      .tap(action$s => expect(action$s).toHaveProperty(TYPE1))
      .tap(action$s => expect(action$s).toHaveProperty(TYPE2));

    const action$ = redux$
      .flatMap(action$s => action$s[TYPE1].merge(action$s[TYPE2]));

    const results = [];
    action$
      .tap(action => results.push(action))
      .tap(_ => {
        if (results.length < 2) { return; }

        const action2 = results[1];
        expect(action2.payload).toBe(false);
        done();
      })
      .observe(() => {});
  });

  test('should not transform actions not included in mappers', done => {
    const Main = withActionStreams({
      [TYPE1]: {
        [TYPE2]: action$ => action$.map(action => type2(!action.payload))
      },
    })(main);

    const sinks = Main();

    const results = [];
    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1].merge(action$s[TYPE2]))
      .tap(action => results.push(action))
      .tap(action => {
        if (results.length < 2) { return; }

        const action1 = results[0];
        const action2 = results[1];
        expect(action1.payload).toBe(true);
        expect(action2.payload).toBe(false);
        done();
      })
      .observe(() => {});
  });

  test('should emit all actions defined in mappers', done => {
    function main() {
      return {
        REDUX: of({
          [TYPE1]: of(type1(1))
        })
      }
    }

    const Main = withActionStreams({
      [TYPE1]: {
        [TYPE2]: action$ => action$.map(action => type2(action.payload + 10)),
        [TYPE3]: action$ => action$.map(action => type2(action.payload + 100)),
      },
    })(main);

    const sinks = Main();

    const results = [];
    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1]
        .merge(action$s[TYPE2])
        .merge(action$s[TYPE3])
      )
      .tap(action => results.push(action))
      .tap(action => {
        if (results.length < 3) { return; }

        const action1 = results[0];
        const action2 = results[1];
        const action3 = results[2];
        expect(action1.payload).toBe(1);
        expect(action2.payload).toBe(11);
        expect(action3.payload).toBe(101);
        done();
      })
      .observe(() => {});
  });

  test('should provide props to mapper', done => {
    const Main = withActionStreams({
      [TYPE1]: {
        [TYPE2]: (action$, { props }) => {
          return action$
            .sample((action, { type1 }) => type2(action.payload && type1), action$, props);
        },
      },
    })(main);

    const sinks = Main({ props: of({ type1: true }) });

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE2])
      .tap(action => expect(action.payload).toBe(true))
      .observe(done);
  });

  test('should provide latest props to mapper', done => {
    function main() {
      return {
        REDUX: of({
          [TYPE1]: of(type1(1))
            .delay(2)
            .startWith(type1(0))
        })
      }
    }

    const Main = withActionStreams({
      [TYPE1]: {
        [TYPE2]: (action$, { props }) => {
          return action$
            .sample((action, { type1 }) => type2(action.payload + type1), action$, props);
        },
      },
    })(main);

    const sinks = Main({
      props: of({ type1: 1 })
        .delay(1)
        .startWith({ type1: 0 })
    });

    const results = [];
    sinks.REDUX
      .flatMap(action$s => action$s[TYPE2])
      .tap(action => results.push(action))
      .tap(action => {
        if (results.length < 2) { return; }

        const action1 = results[0];
        const action2 = results[1];

        expect(action1.payload).toBe(0);
        expect(action2.payload).toBe(2);
        done();
      })
      .observe(() => {}));
  });

  // TODO: use cycle/time to avoid running the actual delay
  test('should not emit if mapper returns undefined', done => {
    function main() {
      const TYPE1$ = of(type1(true))
        .delay(1)
        .startWith(type1(false));

      return {
        REDUX: of({
          [TYPE1]: TYPE1$,
        }),
      };
    }

    const Main = withActionStreams({
      [TYPE1]: {
        [TYPE2]: action$ => action$
          .filter(action => action.payload !== false)
          .map(action => type2(action.payload)),
      },
    })(main);

    const sinks = Main();

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE2])
      .tap(action => expect(action.payload).toBe(true))
      .observe(done);
  });

});

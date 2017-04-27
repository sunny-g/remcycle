/* global describe, expect, test */

import { of } from 'most';
import mapActions from '../../src/hoc/mapActions';

const makeActionCreator = type => payload => ({ type, payload, error: false, meta: {} });

const TYPE1 = 'test/type1';
const TYPE2 = 'test/type2';
const type1 = makeActionCreator(TYPE1);
const type2 = makeActionCreator(TYPE2);

function main() {
  return {
    REDUX: of({
      [TYPE1]: of(type1(true)),
      [TYPE2]: of(type2(true)),
    }),
  };
}

describe('mapActions HOC', () => {

  test('should emit actions transformed by specific mapper', done => {
    const Main = mapActions({
      [TYPE1]: action => ({ ...action, payload: false }),
    })(main);

    const sinks = Main();

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1])
      .tap(action => expect(action.payload).toBe(false))
      .observe(done);
  });

  test('should not transform actions not included in mappers', done => {
    const Main = mapActions({
      [TYPE1]: action => ({ ...action, payload: false }),
    })(main);

    const sinks = Main();

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE2])
      .tap(action => expect(action.payload).toBe(true))
      .observe(done);
  });

  test('should provide props to mapper', done => {
    const Main = mapActions({
      [TYPE1]: (action, { type1 }) => ({ ...action, payload: action.payload && type1 }),
    })(main);

    const sinks = Main({ props: of({ type1: true }) });

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1])
      .tap(action => expect(action.payload).toBe(true))
      .observe(done);
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

    const Main = mapActions({
      [TYPE1]: (action, { type1 }) => {
        if (!action.payload) {
          return;
        }
        return { ...action, payload: action.payload && type1 };
      },
    })(main);

    const sinks = Main({ props: of({ type1: true }) });

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1])
      .tap(action => expect(action.payload).toBe(true))
      .observe(done);
  });

});

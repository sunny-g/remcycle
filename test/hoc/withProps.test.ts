/* global describe, expect, test */

import { of } from 'most';
import withProps from '../../src/hoc/withProps';

function main({ props }) {
  return { props };
}

describe('withProps HOC', () => {

  describe('with props creator or props object', () => {

    test('should take an object of props to be merged', done => {
      const hoc = withProps({ test2: true });
      const Main = hoc(main);

      const sources = { props: of({ test1: true }) };
      const sinks = Main(sources);

      sinks.props
        .tap(props => expect(props.test1).toBe(true))
        .tap(props => expect(props.test2).toBe(true))
        .observe(done);
    });

    test('should take a props creator function', done => {
      const hoc = withProps(({ test1 }) => ({
        test2: !test1,
      }));
      const Main = hoc(main);

      const sources = { props: of({ test1: true }) };
      const sinks = Main(sources);

      sinks.props
        .tap(props => expect(props.test1).toBe(true))
        .tap(props => expect(props.test2).toBe(false))
        .observe(done);
    });

  });

  describe('with watched props and props creator', () => {
    const hoc = withProps(
      [ 'test1' ], ({ test1 }) => ({
        test2: test1 * 100,
      }),
    );
    const Main = hoc(main);

    test('should take watched prop names and props creator', done => {
      const sources = { props: of({ test1: 1 }) };
      const sinks = Main(sources);

      sinks.props
        .tap(props => expect(props.test1).toBe(1))
        .tap(props => expect(props.test2).toBe(100))
        .observe(done);
    });

    test.skip('should take an empty watched props name array and run props creactor', done => {});

    test('should run prop creator when watched props have changed', done => {
      const sources = {
        props: of({ test1: 2 })
          .delay(1)
          .startWith({ test1: 1 })
      };
      const sinks = Main(sources);

      const results = [];
      sinks.props
        .tap(props => results.push(props))
        .tap(_ => {
          if (results.length < 2) { return; }

          const props1 = results[0];
          const props2 = results[1];
          expect(props1.test2).toBe(100);
          expect(props2.test2).toBe(200);
          done();
        })
        .observe(() => {});
    });

    test('should not run props creator when watched props haven\'t changed', done => {
      let propCreatorCallCount = 0;

      const hoc = withProps(
        [ 'test1' ], ({ test1 }) => {
          propCreatorCallCount += 1;

          return {
            test2: test1 * 100,
          };
        },
      );
      const Main = hoc(main);

      const sources = {
        props: of({ test0: 1, test1: 1 })
          .delay(1)
          .startWith({ test0: 0, test1: 1 })
      };
      const sinks = Main(sources);

      const results = [];
      sinks.props
        .tap(props => results.push(props))
        .tap(_ => {
          if (results.length < 2) { return; }

          const props1 = results[0];
          const props2 = results[1];
          expect(props1.test0).toBe(0);
          expect(props1.test1).toBe(1);
          expect(props1.test2).toBe(100);

          expect(props2.test0).toBe(1);
          expect(props2.test1).toBe(1);
          expect(props2.test2).toBe(100);
          expect(propCreatorCallCount).toBe(1);
          done();
        })
        .observe(() => {});
    });

  });

});

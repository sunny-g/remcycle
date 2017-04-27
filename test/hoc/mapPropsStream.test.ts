/* global describe, expect, test */

import { of } from 'most';
import mapPropsStream from '../../src/hoc/mapPropsStream';

describe('mapPropsStream HOC', () => {

  test('should only include props returned from mapper', done => {
    function main({ props }) {
      return { props };
    }

    const props$ = of({ test1: true, test2: false });

    const hoc = mapPropsStream(props$ => props$.map(_ => ({ test2: true })));

    const sinks = hoc(main)({ props: props$ });

    sinks.props
      .tap(props => expect(props.test1).toBeUndefined())
      .tap(props => expect(props.test2).toBeDefined())
      .tap(props => expect(props.test2).toBe(true))
      .observe(done);
  });

});

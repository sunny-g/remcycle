/* global describe, expect, test */

import { of } from 'most';
import mapProps from '../../src/hoc/mapProps';

describe('mapProps HOC', () => {

  test('should only include props returned from mapper', done => {
    function main({ props }) {
      return { props };
    }

    const hoc = mapProps(({ test1 }) => ({
      test1,
      test2: true,
      test3: false,
    }));

    const props$ = of({ test1: true, test2: true });

    const sinks = hoc(main)({ props: props$ });

    sinks.props
      .tap(props => expect(props.test1).toBe(true))
      .tap(props => expect(props.test2).toBe(true))
      .tap(props => expect(props.test3).toBe(false))
      .observe(done);
  });

});

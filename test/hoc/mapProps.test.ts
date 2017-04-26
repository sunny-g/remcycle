/* global describe, expect, test */

import { of } from 'most';
import mapProps from '../../src/hoc/mapProps';

describe('mapProps HOC', () => {

  test('should only include props returned from mapper', done => {
    function main({ props }) {
      return { props };
    }

    const props$ = of({ test1: true, test2: false });

    const hoc = mapProps(props => ({
      test2: true,
    }));

    const sinks = hoc(main)({ props: props$ });

    sinks.props
      .tap(props => expect(props.test1).toBeUndefined())
      .tap(props => expect(props.test2).toBeDefined())
      .tap(props => expect(props.test2).toBe(true))
      .observe(done);
  });

});

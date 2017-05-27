/* global describe, expect, test */

import { of } from 'most';
import defaultProps from '../../src/hoc/defaultProps';

describe('defaultProps HOC', () => {

  test('should include default props when not provided', done => {
    function main({ props }) {
      return { props };
    }

    const hoc = defaultProps({
      test2: true,
    });

    const props$ = of({ test1: true });

    const sinks = hoc(main)({ props: props$ });

    sinks.props
      .tap(props => expect(props.test1).toBe(true))
      .tap(props => expect(props.test2).toBe(true))
      .observe(done);
  });

  test('should not include default props when provided', done => {
    function main({ props }) {
      return { props };
    }

    const hoc = defaultProps({
      test2: true,
    });

    const props$ = of({ test1: true, test2: false });

    const sinks = hoc(main)({ props: props$ });

    sinks.props
      .tap(props => expect(props.test1).toBe(true))
      .tap(props => expect(props.test2).toBe(false))
      .observe(done);
  });

});

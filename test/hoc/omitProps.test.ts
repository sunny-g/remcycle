/* global describe, expect, test */

import { of } from 'most';
import omitProps from '../../src/hoc/omitProps';

describe('omitProps HOC', () => {

  test('should only not include specified props', done => {
    function main({ props }) {
      return { props };
    }

    const hoc = omitProps([ 'test2' ]);

    const props$ = of({ test1: true, test2: true, test3: false });

    const sinks = hoc(main)({ props: props$ });

    sinks.props
      .tap(props => expect(props.test1).toBe(true))
      .tap(props => expect(props.test2).toBeUndefined())
      .tap(props => expect(props.test3).toBe(false))
      .observe(done);
  });

});

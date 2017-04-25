/* global describe, expect, test */

import { of } from 'most';
import mapProps from '../../src/hoc/mapProps';

describe('mapProps HOC', () => {

  test('should only include props returned from mapper', done => {
    const props$ = of({ test1: true, test2: false });

    const hoc = mapProps(props => ({
      ...props,
      test2: true,
    }));

    function main({ props: propsSource }) {
      propsSource
        .tap(props => expect(props.test1).toBe(true))
        .tap(props => expect(props.test2).toBe(true))
        .tap(props => expect(props.test3).toBeUndefined())
        .observe(done);

      return {};
    }

    return hoc(main)({ props: props$ });
  });

});

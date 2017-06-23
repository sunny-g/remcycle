/* global describe, expect, test */

import { of } from 'most';
import { createElement } from 'react';
import { fromReactDOMComponent } from '@sunny-g/cycle-react-driver/es2015/dom';
import mapView from '../../src/hoc/mapView';

describe('mapView HOC', () => {

  const Hello = ({ name }) => (
    createElement('div', null, `Hello ${name}`)
  );
  const HelloComponent = fromReactDOMComponent('REACT', Hello);

  test('should wrap a React vtree with other React elements', done => {
    const hoc = mapView((_, vtree) =>
      createElement('div', null, vtree)
    );

    const props = { name: 'World!'};
    const sources = { props: of(props) };
    const sinks = hoc(HelloComponent)(sources);

    sinks.REACT
      .tap(vtree => expect(vtree.type).toBe('div'))
      .tap(vtree => {
        const childVtree = vtree.props.children;
        expect(childVtree.type).toBe(Hello);
        expect(childVtree.props).toMatchObject(props);
        done();
      })
      .observe(() => {});
  });

  test.skip('should update new React vtree when receiving new props', done => {});

});

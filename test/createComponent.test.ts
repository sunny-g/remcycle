/* global describe, expect, test */

import { of } from 'most';
import React from 'react';
import { fromReactDOMComponent } from '@sunny-g/cycle-react-driver/es2015/dom';
import createComponent from '../src/createComponent';

describe('createComponent', () => {

  test('should be a function', () => {
    expect(createComponent).toBeInstanceOf(Function);
  });

  test('should only require a React view', () => {
    const Hello = () => (
      React.createElement('div', null, 'Hello')
    );

    const HelloComponent = createComponent({
      main: fromReactDOMComponent('REACT', Hello),
    });

    expect(HelloComponent).not.toThrow();
  });

  test('should render the provided props', done => {
    const Hello = ({ name }) => (
      React.createElement('div', null, `Hello ${name}`)
    );

    const HelloComponent = createComponent({
      main: fromReactDOMComponent('REACT', Hello),
    });

    const name = 'World!';
    const sinks = HelloComponent({ props: of({ name }) });

    return sinks.REACT
      .tap(element => expect(element['$$typeof']).toBe(Symbol.for('react.element')))
      .tap(element => expect(element.props.name).toBe(name))
      .observe(done)
  });

});

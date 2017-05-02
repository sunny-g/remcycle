/* global describe, expect, test */

import { of } from 'most';
import React from 'react';
import { ReactSource } from '@sunny-g/cycle-react-driver/es2015';
import { fromReactDOMComponent } from '@sunny-g/cycle-react-driver/es2015/dom';
import reduxSinksCombiner from '../src/reduxSinksCombiner';
import addActionHandlers from '../src/hoc/addActionHandlers';

const makeActionCreator = type => payload => ({ type, payload, error: false, meta: {} });

const TYPE1 = 'test/type1';
const TYPE2 = 'test/type2';
const type1 = makeActionCreator(TYPE1);
const type2 = makeActionCreator(TYPE2);

function main({ props }) {
  return { props };
}

describe('reduxSinksCombiner', () => {

  test('should merge two REDUX sinks with exclusive REDUX sink streams', done => {
    const Main1 = addActionHandlers({
      onClick: {
        type: TYPE1,
        actionCreator: _ => type1(text),
      }
    })(main);

    const Main2 = addActionHandlers({
      onClick: {
        type: TYPE2,
        actionCreator: _ => type2(text),
      }
    })(main);

    const sources = { REACT: new ReactSource() };
    const sinks1 = Main1(sources);
    const sinks2 = Main2(sources);

    const combinedReduxSink$ = reduxSinksCombiner(sinks1.REDUX, sinks2.REDUX);

    combinedReduxSink$
      .tap(action$s => expect(action$s).toHaveProperty(TYPE1))
      .tap(action$s => expect(action$s[TYPE1].source.constructor.name).toBe('MulticastSource'))
      .tap(action$s => expect(action$s).toHaveProperty(TYPE2))
      .tap(action$s => expect(action$s[TYPE1].source.constructor.name).toBe('MulticastSource'))
      .observe(done);
  });

  test('should merge two REDUX sinks with non-exclusive REDUX sink streams', done => {
    const Main1 = addActionHandlers({
      onClick: {
        type: TYPE1,
        actionCreator: ({ text }) => type1(text),
      }
    })(main);

    const Main2 = addActionHandlers({
      onClick: {
        type: TYPE1,
        actionCreator: _ => type1(text),
      },
      onClick2: {
        type: TYPE2,
        actionCreator: _ => type2(text),
      }
    })(main);

    const sources = { REACT: new ReactSource() };
    const sinks1 = Main1(sources);
    const sinks2 = Main2(sources);

    const combinedReduxSink$ = reduxSinksCombiner(sinks1.REDUX, sinks2.REDUX);

    combinedReduxSink$
      .tap(action$s => expect(action$s).toHaveProperty(TYPE1))
      .tap(action$s => expect(action$s[TYPE1].source.constructor.name).toBe('Merge'))
      .tap(action$s => expect(action$s).toHaveProperty(TYPE2))
      .tap(action$s => expect(action$s[TYPE2].source.constructor.name).toBe('MulticastSource'))
      .observe(done);
  });

});

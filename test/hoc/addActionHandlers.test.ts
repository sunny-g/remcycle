/* global describe, expect, test */

import { of } from 'most';
import { proxy } from 'most-proxy';
import React from 'react';
import { ReactSource } from '@sunny-g/cycle-react-driver/es2015';
import { fromReactDOMComponent } from '@sunny-g/cycle-react-driver/es2015/dom';
import addActionHandlers from '../../src/hoc/addActionHandlers';

const makeActionCreator = type => payload => ({ type, payload, error: false, meta: {} });

const TYPE1 = 'test/type1';
const TYPE2 = 'test/type2';
const type1 = makeActionCreator(TYPE1);
const type2 = makeActionCreator(TYPE2);

function main({ props }) {
  return { props };
}

describe('addActionHandlers HOC', () => {

  test('should add handlers to props stream', done => {
    const Main = addActionHandlers({
      onClick: {
        type: TYPE1,
        actionCreator: ({ text }) => type1(text),
      }
    })(main);

    const text = 'World!';
    const sinks = Main({ REACT: new ReactSource(), props: of({ text }) });

    sinks.props
      .tap(props => expect(props.text).toBe(text))
      .tap(props => expect(props.onClick).toBeInstanceOf(Function))
      .observe(done);
  });

  test('should emit actions based on `actionCreator` logic when handler is invoked', done => {
    function main({ props }) {
      return {
        props: props
          .tap(({ onClick }) => setTimeout(_ => onClick(false), 0)),
      };
    }

    const Main = addActionHandlers({
      onClick: {
        type: TYPE1,
        actionCreator: ({ text }) => type1(text),
      }
    })(main);

    const text = 'World!';
    const sources = { REACT: new ReactSource(), props: of({ text }) };
    const sinks = Main(sources);

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1])
      .tap(action => expect(action.payload).toBe(text))
      .observe(done);

    sinks.props.observe(() => {});
  });

  test('should emit actions based on `actionCreatorStream` logic when handler is invoked', done => {
    function main({ props }) {
      return {
        props: props
          .tap(({ onClick }) => setTimeout(_ => onClick(false), 0)),
      };
    }

    const Main = addActionHandlers({
      onClick: {
        type: TYPE1,
        actionCreatorStream: (sources, event$) => {
          return event$
            .sample((_, props) => type1(props.text), event$, sources.props);
        },
      }
    })(main);

    const text = 'World!';
    const sources = { REACT: new ReactSource(), props: of({ text }) };
    const sinks = Main(sources);

    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1])
      .tap(action => expect(action.payload).toBe(text))
      .observe(done);

    sinks.props.observe(() => {});
  });

  test.skip('should emit actions eagerly if specified', done => {
    function main({ REDUX, props }) {
      const action$ = REDUX.flatMap(action$s => action$s[TYPE1]);
      return {
        props: props
          .sample((_, props) => props,
            action$, props.tap(({ onClick }) => onClick(false))
          ),
      };
    }

    const Main = addActionHandlers({
      onClick: {
        hold: true,
        type: TYPE1,
        actionCreatorStream: (sources, event$) => {
          return event$
            .tap(::console.log)
            .sample((props) => type1(props.text), sources.props.tap(::console.log), event$);
        },
      }
    })(main);

    const text = 'World!';
    const { attach, stream: ReduxSource } = proxy();
    const sources = {
      REACT: new ReactSource(),
      REDUX: ReduxSource,
      props: of({ text }),
    };
    const sinks = Main(sources);

    // sinks.props.observe(() => {});
    attach(sinks.REDUX)
    sinks.REDUX
      .flatMap(action$s => action$s[TYPE1])
      .tap(action => expect(action.payload).toBe(text))
      .observe(done);
  });

});

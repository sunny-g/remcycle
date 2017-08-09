# remcycle
*a [Cycle.js](https://cycle.js.org)-based component factory and set of higher-order-components built on [cycle-react-driver](https://github.com/sunny-g/cycle-react-driver), [cycle-redux-driver](https://github.com/sunny-g/cycle-redux-driver), and [most](https://github.com/cujojs/most)*

<!--## why-->

## installation
```
npm install --save remcycle
```

## usage
<!-- Re-implementation of the Cycle.js [counter](https://github.com/cyclejs/cyclejs/tree/master/examples/counter) example: -->

```js
import mapProps from 'remcycle/es2015/hoc/mapProps'; // HOCs
import createComponent from 'remcycle/es2015/createComponent'; // helpers
import { shallowEquals } from 'remcycle/es2015/util'; // utilities
```

## api

A **higher-order component** (HOC) is a function that takes in a Cycle.js component and returns a Cycle.js component.

This pattern makes HOCs composable and allows us to use [Ramda](http://ramdajs.com/)'s [`compose`](http://ramdajs.com/docs/#compose) or [`pipe`](http://ramdajs.com/docs/#pipe) functions to stitch multiple HOCs together into a single, larger HOC.

The following HOC factories and utilities are provided by this library:

* Prop-related HOCs:
  * [`mapProps`](#mapprops)
  * [`mapPropsStream`](#mappropsstream)
  * [`withProps`](#withprops)
  * [`withPropsOnChange`](#withpropsonchange)
  * [`withState`](#withstate)
  * [`defaultProps`](#defaultprops)
  * [`omitProps`](#omitprops)
  <!-- * [`renameProps`](#renameprops) -->
  <!-- * [`onlyUpdateforProps`](#onlyupdateforprops) -->
  * [`doOnPropsChange`](#doonpropschange)
* Action-related HOCs:
  * [`mapActions`](#mapactions)
  * [`mapActionStreams`](#mapactionstreams)
  * [`withActions`](#withactions)
  * [`withActionStreams`](#withactionstreams)
  <!-- * [`mapPropsToActions`](#mappropstoactions) -->
  <!-- * [`mapPropsToActionStreams`](#mappropstoactionstreams) -->
  <!-- * [`defaultActions`](#defaultactions) -->
  <!-- * [`defaultActionStreams`](#defaultactionstreams) -->
  <!-- * [`mergeActions`](#mergeactions) -->
  <!-- * [`mergeActionStreams`](#mergeactionstreams) -->
  <!-- * [`omitActions`](#omitactions) -->
* Helper and other HOCs:
  * [`addActionHandlers`](#addactionhandlers)
  * [`mapView`](#mapview)
  * [`withCollection`](#withcollection)
  * [`addActionTypes`](#addactiontypes)
  * [`addPropTypes`](#addproptypes)
  * [`logActions`](#logactions)
  * [`logProps`](#logprops)
* Utilities:
  * [`createComponent`](#createcomponent)
  * [`reactSinksCombiner`](#reactsinkscombiner)
  * [`reduxSinksCombiner`](#reduxsinkscombiner)
  * [`shallowEquals`](#shallowequals)

*NOTE: A few HOC factories have two versions, one that exposes single `props` or `action` objects and another that exposes the raw `props` source stream, `action` streams and component sources - use the latter for more granular control over stream manipulation and creation.*

### `mapProps`

```js
mapProps(propsMapper: (props: {}) => {}): HigherOrderComponent
```

Transforms `props` to be passed into the base component as the `props` source stream.

Useful as a base HOC for higher-level HOCs for transforming props (e.g. renaming, omitting, etc).

##### example:

```js
mapProps(({ count, ...props }) => ({
  value: count, // renames the count prop, omits the rest from the props source stream
}));
```

### `mapPropsStream`

```js
mapPropsStream(
  propsStreamMapper: (propsSource: Stream<{}>) => Stream<{}>,
): HigherOrderComponent
```

Same as `mapProps`, but transforms the `props` source stream (or `of({})` if `props` source is `undefined`).

Useful as a base HOC for higher-level HOCs for more granular control over transforming props (e.g. throttling, filtering, etc).

##### example:

```js
mapPropsStream(propsSource => {
  return propsSource
    .map(({ count, ...props }) => ({
      value: count, // same example as above
    }));
});
```

### `withProps`

```js
withProps(
  propsOrPropsCreator: {} | (props: {}) => {} | void,
): HigherOrderComponent

withProps(
  watchedPropNames: string | string[],
  propsCreator: (props: {}) => {} | void,
): HigherOrderComponent
```

Merges into the `props` stream new `props`, either created from an object or a function that returns new `props`.

Either:

- accepts `props` to be merged with upstream `props`, or a function that transforms upstream `props` into new `props` to be merged
- accepts name(s) of `props` to watch for changes (using `shallowEquals`), and when they have changed, run the `propsCreator` on upstream `props` to return new `props` to be merged.

If `propsCreator` returns `undefined`, upstream `props` are emitted unchanged.

Useful for adding new `props`, overwriting upstream `props`, or for merging in new `props` that are expensive to create via the `propsCreator`.

*NOTE: the watching behaviour is only included in this HOC factory for backwards-compatibility reasons - if you want to control when you create new `props`, you should use [`withPropsOnChange`](#withpropsonchange).*

##### example:

```js
// merging props from props object
withProps({ name: 'Selector' });

// merging props from props creator
withProps(({ val }) => ({ value: val })); // simple renaming of props

// merging props from props creator on props change
withProps(
  [ 'params.prop1', 'dependencyProp' ], // can take multiple and/or nested prop names
  ({ dependencyProp }) => {
    // ... perform expensive operations here
    return {
      // ... new props to merge into upstream props
    };
  },
);
```

### `withPropsOnChange`

```js
withPropsOnChange(
  namesOrPredicate: string | string[] | (currentProps: {}, previousProps: {}) => boolean,
  propsCreator: (props: {}) => {} | void,
): HigherOrderComponent
```

Accepts name(s) of `props` to watch for changes (using `shallowEquals`) or a `predicate` function applied to `currentProps` and `previousProps`, and when the listed `props` have changed (or when the `predicate` returns `true`), run the `propsCreator` on upstream `props` to return new `props` to be merged.

If `propsCreator` returns `undefined`, upstream `props` are emitted unchanged.

Useful for merging in new `props` that are expensive to create via the `propsCreator`.

##### example:

```js
// merging props from props creator on props change
withPropsOnChange(
  [ 'params.prop1', 'dependencyProp' ], // can take multiple and/or nested prop names
  ({ dependencyProp }) => {
    // ... perform expensive operations here
    return {
      // ... new props to merge into upstream props
    };
  },
);

// merging props from props creator based on predicate's return value
withPropsOnChange(
  ({ dependencyProp: current }, { dependencyProp: previous }) => {
    // only when this prop is unequal to it's previous value
    return current !== previous;
  },
  ({ dependencyProp: current }) => {
    // ... perform expensive operations here
    return {
      // ... new props to merge into upstream props
    };
  },
);
```

### `withState`

```js
withState<T>(
  stateName: string,
  initialStateOrCreator: T | (props: {}) => T,
  actionReducers?: {
    [actionType: string]:
      (state: T, action: FluxStandardAction<any>, props: {}) => T,
  },
  propReducers?: {
    [propNames: string | string[]]:
      (state: T, props: {}) => T,
  },
): HigherOrderComponent
```

Creates, merges into the `props` source stream, and maintains the state of a new/existing `prop` using the reducer pattern.

`initialStateOrCreator` is either the initial state of the `prop` or a function that creates the initial state from the current `props`.

`actionReducers` select the `REDUX` source stream using the given `actionType` and on each action, invokes the reducer on the `state`, the `action`, and the current `props`.

`propReducers` watch the given `propName(s)` (possibly nested) for changes (using `shallowEquals`) and when changed, invokes the reducer on the `state` and current `props`.

##### example:

```js
withState(
  'count',
  ({ count }) => count !== undefined ? count : 0,
  {
    'Counter/increment': (count, { payload }) => count += payload,
    'Counter/decrement': (count, { payload }) => count -= payload,
    'Counter/reset': _ => 0,
  }, {
    count: (_, { count }) => count // parent is resetting the state
  },
);
```

### `defaultProps`

```js
defaultProps({ [propName: string]: any }): HigherOrderComponent
```

Merges in a set of `props`, unless they already exist in the `props` source stream. Like `withProps`, but upstream `props` already in the `props` source stream take precedence.

##### example:

```js
// if parent didn't provide a `value` prop for the <input type="number" /> tag, set it to 0 as a reasonable default
defaultProps({
  type: 'number',
  value: 0,
});
```

### `omitProps`

```js
omitProps(string | string[]): HigherOrderComponent
```

Omits props from the `props` source stream.

##### example:

```js
omitProps([ 'isLoading' ]); // omits the prop `isLoading`, perhaps because it wasn't needed
```

### `doOnPropsChange`

```js
doOnPropsChange(
  propsCreator: (props: {}) => {} | void,
): HigherOrderComponent

doOnPropsChange(
  watchedPropNames: string | string[],
  propsCreator: (props: {}) => {} | void,
): HigherOrderComponent

doOnPropsChange(
  namesOrPredicate: string | string[] | (currentProps: {}, previousProps: {}) => boolean,
  propsCreator: (props: {}) => {} | void,
): HigherOrderComponent
```

Syntactically-identical to `withProps` or `withPropsOnChange`, but is recommended to be used when performing imperative/mutable/impure changes to existing `props`.

### `mapActions`

```js
mapActions<T>(
  { [actionType: string]:
    (action: FluxStandardAction<T>, props: {}) => FluxStandardAction<T> | void
  }
): HigherOrderComponent
```

Transforms an `action` of the given `actionType` with the current `props`. If the transform returns `undefined`, the `action` is filtered out of the `action` stream.

Useful for augmenting `action` payloads or filtering out `action`s with invalid or undesirable payloads.

##### example:

```js
// filters out any values greater than the `maxAllowable` for the <input type="number"/> tag
mapActions({
  'Input/change': (action, { maxAllowable }) => {
    return (Number(action.payload) > maxAllowable) ? void 0 : action;
  },
});
```

### `mapActionStreams`

```js
mapActionStreams<T>(
  { [actionType: string]:
    (action: Stream<FluxStandardAction<T>>, sources: {}) => Stream<FluxStandardAction<T>>
  }
): HigherOrderComponent
```

Identical to [`mapActions`](#mapactions), except the `action` stream creator function takes the `action` stream of the given `actionType` and all of the component's sources, returning the new `action` stream.

##### example:

```js
// same example as above
// filters out any values greater than the `maxAllowable` for the <input type="number"/> tag
mapActionStreams({
  'Input/change': (action$, { props: propsSource = of({}) }) => {
    const maxAllowable$ = propsSource.map(({ maxAllowable }) => maxAllowable);

    return action$
      .sample((action, maxAllowable) => ([ action, maxAllowable ]), action$, maxAllowable$)
      .filter(([ { payload }, maxAllowable ]) => Number(payload) <= maxAllowable)
      .map(([ action ]) => action)
      .multicast();
  },
});
```

### `withActions`

```js
withActions<T, U>(
  { [listenedActionType: string]:
    { [emittedActionType: string]:
      (listenedAction: FluxStandardAction<T>, props: {}) => FluxStandardAction<U>
    }
  }
): HigherOrderComponent
```

Multiplexes an `action` stream onto another `action` stream - `action` creator function takes in each `listenedActionType` action and current `props` and returns an `action` of the `emittedActionType`. If an `action` stream of the `emittedActionType` already exists, the returned `action`s will be merged into that stream.

Useful for emitting an additional `action` when a given action is emitted, or generally mapping a particular source to a new `action` stream.

##### example:

```js
// maps an Input component change action to a new action specific to the MaxInput component
withActions({
  'Input/change': {
    'MaxInput/set': ({ payload }) => setMaxInput(payload),
  },
});
```

### `withActionStreams`

```js
withActionStreams<T, U>(
  { [listenedActionType: string]:
    { [emittedActionType: string]:
      (listenedActionStream: Stream<FluxStandardAction<T>>, sources: {}) => Stream<FluxStandardAction<U>>
    }
  }
): HigherOrderComponent
```

Identical to [`withActions`](#withactions), except the `action` stream creator function takes the `action` stream of the given `listenedActionType` and all of the component's sources, returning the new `action` stream. If an `action` stream of the `emittedActionType` exists, the returned `action` stream will be merged into that stream.

##### example:

```js
// same example as above, but debounces the emitted actions before emitting
// maps an Input component change action to a new action specific to the MaxInput component
withActionStreams({
  'Input/change': {
    'MaxInput/set': (inputChangeAction$, { Time }) => inputChangeAction$
      .thru(Time.debounce(250))
      .map(({ payload }) => setMaxInput(payload)),
  },
});

```

### `addActionHandlers`

```js
addActionHandlers(
  { [handlerPropName: string]:
    { type: string,
      actionCreator: (props: {}, eventArgs: any | any[]) => FluxStandardAction<any>,
      actionStreamCreator: (sources: {}, event$: Stream<any>) => Stream<FluxStandardAction<any>>,
      hold?: boolean,
    }
  }
): HigherOrderComponent
```

Similar to Redux's `mapDispatchToProps`. `addActionHandlers` does two things:

- merges into the `props` source stream a handler function of the provided `handlerPropName`
- creates a `action` sink stream that emits an `action` when the handler is invoked.

If you declare the `actionCreator` property, the `actionCreator` function accepts the current `props` and the `eventArg` value passed into the handler (or an array of values if the handler is invoked with multiple arguments) and should return the `action` of the desired `type`.

If you declare the `actionStreamCreator` property, the `actionStreamCreator` function accepts the component's sources and the stream of `eventArgs` emitted when the handler is invoked (again, with a single value or an array values, depending on the number of parameters passed into the handler) and should return a stream of `actions` of the desired `type`.

The `hold` property should be specified as `true` (default is `false`) if the `action` stream should remember it's last `action`.

Useful for imperatively generating actions, most commonly from passing the handlers into a React component.

##### example:

```js
// emits `'Input/change'` actions when the `onChange` handler is invoked, perhaps in an <input /> component
addActionHandlers({
  onChange: {
    type: 'Input/change',
    actionCreator: (_, e) => inputChange(e.target.value),
  },
});
```

### `mapView`

```js
mapView(
  viewMapper: (vtree: ReactElement<any>, props: {}) => ReactElement<any>,
  propsToPluck?: string | string[],
): HigherOrderComponent
```

Wraps a component's React element sink or it's child's React sink with additional React elements.

Optionally, allows you to specify `props` to pluck from the `props` source stream to use for rendering the wrapper component (defaults to `'*'` which then passes all `props` to the `viewMapper`).

##### example:

```js
const Container = ({ childVtree, className }) =>
  <div className={className}>
    {childVtree}
  </div>;

mapView(
  (vtree, { className }) => Container({ childVtree: vtree, className }),
  [ 'className' ],
);
```

### `withCollection`

```js
withCollection(
  collectionName: string,
  initialCollectionOrCreator: Collection | (sources: {}) => Collection,
  actionReducers?: {
    [actionType: string]:
      (collection: Collection, action: FluxStandardAction<any>, props: {}, sources: {}) => Collection,
  },
  propReducers?: {
    [propNames: string | string[]]:
      (collection: Collection, props: {}, sources: {}) => Collection,
  },
): HigherOrderComponent
```

Creates and maintains the state of a [Most.js Collection](https://github.com/motorcyclejs/collection), returning a stream of the collection's state and merging it into the component's sources (so that it can be manipulated in subsequent HOCs).

`initialCollectionOrCreator` is either the initial collection or a function that creates the initial collection from the sources.

`actionReducers` select a `REDUX` source stream using the given `actionType` and on each action, invokes the reducer on the collection, the `action`, the current `props` and all sources.

`propReducers` watch the given `propName(s)` (possibly nested) for changes (using `shallowEquals`) and when changed, invokes the reducer on the collection, current `props` and all sources.


##### example:

```js
// manages a collection of children `TodoItem` components and their state
withCollection('todoItems', Collection(TodoItem), {
  'TodoList/add': (todos, { payload: text }) => {
    const props$ = of({ text, isComplete: false });

    return todos.add({ ...sources, props: props$ });
  },
  'TodoList/toggleAll': (todos, { payload: allChecked }) => {
    return Array(todos.size).fill(0)
      .reduce((newTodos, _, index) => {
        const todo = todos.getAt(index);
        const props$ = todo.input.props
          .map(props => ({ ...props, isComplete: allChecked }));

        return newTodos.setAt(index, { ...todo.input, props: props$ });
      }, todos);
  },
});
```

### `addActionTypes`

```js
addActionTypes(
  componentName: string,
  { [actionType: string]: PropType }
): HigherOrderComponent
```

Augments the Redux `action` sink, performing [prop-type](https://github.com/facebook/prop-types) checks on each `action` payload.

##### example:

```js
addActionTypes('Input', {
  'Input/change': PropTypes.string,
});
```

### `addPropTypes`

```js
addPropTypes(
  componentName: string,
  { [propName: string]: PropType }
): HigherOrderComponent
```

Augments the `props` source stream, performing [prop-type](https://github.com/facebook/prop-types) checks on the `props` object.

##### example:

```js
addPropTypes('Input', {
  value: PropTypes.string.isRequired,
  type: PropTypes.string,
});
```

### `logActions`

```js
logActions(
  sinkLogger: ({ [actionType: string]: Stream<FluxStandardAction<any>> }) => void,
  actionLoggers: { [actionType: string]: (<FluxStandardAction<any>) => void },
): HigherOrderComponent
```

Takes in an optional `sinksLogger` function which logs all `action` streams in the Redux sink, and an object of logging functions for any given `actionType`.

##### example:

```js
logActions(::console.log, {
  'Input/change': ::console.log,
});
```

### `logProps`

```js
logProps(
  propsLogger: (props: {}) => void,
): HigherOrderComponent
```

Logs all `props` from the upstream `props` source stream.

##### example:

```js
logProps(::console.log);
```

### `createComponent`

```js
```

Blah blah blah

##### example:

```js
```

### `reactSinksCombiner`

```js
type ReactSink = Stream<ReactElement<any>>;

reactSinksCombiner(
  view: (...vtrees: ReactElement<any>[], props: {}) => ReactElement<any>,
  propsSource?: Stream<{}>,
): (...reactSinks: ReactSink[]) => ReactSink
```

Helper for combining the React sinks of multiple sibling components into a single React sink, but can be used as a shorthand to `combine` any set of sinks.

##### example:

```js
import reactSinksCombiner from 'remcycle/es2015/reactSinksCombiner';

function main(sources) {
  const todoItemOneSinks = TodoItem(sources);
  const todoItemTwoSinks = TodoItem(sources);

  // props required for the combined React view component
  const viewProps$ = sources.props.map(({ className }) => ({ className }));

  // the view that combines the vtrees and props
  const TodoListView = (todoItemOneVtree, todoItemTwoVtree, { className }) =>
    <div className={className}>
      {todoItemOneVtree}
      {todoItemTwoVtree}
    </div>;

  const mainReactSink = reactSinksCombiner(TodoListView, viewProps$)(todoItemOneSinks.REACT, todoItemTwoSinks.REACT);

  return {
    REACT: mainReactSink,
  };
}
```

### `reduxSinksCombiner`

```js
type ReduxSink = Stream<{ [actionType: string]: Stream<FluxStandardAction<any>> }>

reduxSinksCombiner(...reduxSinks: ReduxSink[]): ReduxSink
```

Helper for merging the Redux sinks of multiple sibling components into a single Redux sink. If multiple `action` streams of the same `actionType` exist, the streams are merged together.

##### example:

```js
import reduxSinksCombiner from 'remcycle/es2015/reduxSinksCombiner';

function main(sources) {
  const todoItemOneSinks = TodoItem(sources);
  const todoItemTwoSinks = TodoItem(sources);

  const mainReduxSink = reduxSinksCombiner(todoItemOneSinks.REDUX, todoItemTwoSinks.REDUX);

  return {
    REDUX: mainReduxSink,
  };
}
```

### `shallowEquals`

```js
shallowEquals(any, any): boolean
```

Determines if two JS value or reference types are shallowly equal to eachother (using `===`). If an `array` or `object`, strict equality is applied to all elements/properties. Directly exported from the [shallow-equals](https://github.com/hughsk/shallow-equals) library.

##### example:

```js
import { shallowEquals } from 'remcycle/es2015/util';

shallowEquals({ a: 1 }, { a: 1 });  // true
shallowEquals({ a: 1 }, { b: 1 });  // false
```

## contributing

#### todo

- ensure typescript typings are correct and comprehensive and exported correctly
- ensure build tooling with `tsc` and `webpack` is correct
- explain contribution process
- add more tests :)
- explain why I wrote this

## license
ISC

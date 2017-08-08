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
import createComponent from 'remcycle/es2015/createComponent'; // utilities
import mapProps from 'remcycle/es2015/hoc/mapProps'; // HOCs
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

*NOTE: Many HOC factories have two versions, one that exposes `props` and `action`s and another that exposes the raw `props` source stream, `action` streams and component sources - use the latter for more granular control over stream manipulation and creation.*

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
  actionReducers: {
    [actionType: string]:
      (state: T, action: FluxStandardAction<any>, props: {}) => T,
  },
  propReducers: {
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
defaultProps({
  count: 0, // if parent didn't provide a `count` prop, set it to 0 as a reasonable default
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
```

### `addActionTypes`

```js
```

Blah blah blah

##### example:

```js
```

### `addPropTypes`

```js
```

Blah blah blah

##### example:

```js
```

### `logActions`

```js
```

Blah blah blah

##### example:

```js
```

### `logProps`

```js
```

Blah blah blah

##### example:

```js
```

### `mapView`

```js
```

Blah blah blah

##### example:

```js
```

### `withCollection`

```js
```

Blah blah blah

##### example:

```js
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
```

Blah blah blah

##### example:

```js
```

### `reduxSinksCombiner`

```js
```

Blah blah blah

##### example:

```js
```

### `shallowEquals`

```js
```

Blah blah blah

##### example:

```js
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

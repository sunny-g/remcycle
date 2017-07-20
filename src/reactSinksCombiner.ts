import { combineArray, of, Stream } from 'most';

const reactSinksCombiner = (view, propsSource = of({})) =>
  (...reactSinks) =>
    combineArray(view, [].concat(reactSinks, propsSource));

export default reactSinksCombiner;

/* global process */

import curry from 'ramda/src/curry';
const shallowEquals = require('shallow-equals');

export { shallowEquals };

export const throwIfMissing = () => {
  throw new Error(`Missing parameter`);
}

export const isProd = () => {
  return process
    && process.env
    && process.env.NODE_ENV
    && process.env.NODE_ENV === 'production';
}

// alt for ramda/src/mapObjIndexed
export const mapObj = curry((valueKeyMapper, obj) =>
  Object
    .keys(obj)
    .reduce((newObj, key) => ({
      ...newObj,
      [key]: valueKeyMapper(obj[key], key, obj),
    }), {}));

export const compose = (...fns) => arg => fns.reverse().reduce((val, fn) => fn(val), arg);
export const pipe = (...fns) => arg => fns.reduce((val, fn) => fn(val), arg);

export const omit = curry((keys, obj) =>
  Object
    .keys(obj)
    .reduce((newObj, key) => {
      if (keys.includes(key)) {
        return newObj;
      }
      return { ...newObj, [key]: obj[key] };
    }, {}));

export const path = curry((paths, obj) => {
  let val = obj;
  let idx = 0;
  while (idx < paths.length) {
    if (val == null) { return; }
    val = val[paths[idx]];
    idx += 1;
  }
  return val;
});

export const pick = curry((keys, obj) =>
  []
    .concat(keys)
    .reduce((newObj, key) => {
      const keyPath = key.split('.');
      const objKey = keyPath[keyPath.length - 1];
      return { ...newObj, [objKey]: path(keyPath, obj) };
    }, {}));

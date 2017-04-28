export {
  compose,
  mapObj,
  omit,
  pick,
  pipe,
  shallowEquals,
} from './util';

export { addActionHandlers } from './hoc/addActionHandlers';
export { isolate } from './hoc/isolate';
export { logProps } from './hoc/logProps';
export { mapActions } from './hoc/mapActions';
export { mapProps } from './hoc/mapProps';
export { mapPropsStream } from './hoc/mapPropsStream';
export { mapView } from './hoc/mapView';
export { withActions } from './hoc/withActions';
export { withActionStreams } from './hoc/withActionStreams';
export { withProps } from './hoc/withProps';

import mergeReduxSinks, { reduxSinkCombiner } from './mergeReduxSinks';
import createComponent from './createComponent';

export { reduxSinkCombiner };
export { mergeReduxSinks };
export default createComponent;

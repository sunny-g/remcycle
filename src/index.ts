import addActionHandlers from './hoc/addActionHandlers';
import isolate from './hoc/isolate';
import logActions from './hoc/logActions';
import logProps from './hoc/logProps';
import mapActions from './hoc/mapActions';
import mapProps from './hoc/mapProps';
import mapPropsStream from './hoc/mapPropsStream';
import mapView from './hoc/mapView';
import withActions from './hoc/withActions';
import withActionStreams from './hoc/withActionStreams';
import withProps from './hoc/withProps';

import reduxSinksCombiner from './reduxSinksCombiner';
import createComponent from './createComponent';

export {
  compose,
  mapObj,
  omit,
  pick,
  pipe,
  shallowEquals,
} from './util';

export { addActionHandlers };
export { isolate };
export { logActions };
export { logProps };
export { mapActions };
export { mapProps };
export { mapPropsStream };
export { mapView };
export { withActions };
export { withActionStreams };
export { withProps };

export { reduxSinksCombiner };
export default createComponent;

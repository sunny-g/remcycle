import addActionHandlers from './hoc/addActionHandlers';
import isolate from './hoc/isolate';
import logProps from './hoc/logProps';
import mapActions from './hoc/mapActions';
import mapProps from './hoc/mapProps';
import withActions from './hoc/withActions';
import withProps from './hoc/withProps';

import mergeReduxSinks, { reduxSinkCombiner } from './mergeReduxSinks';
import createComponent from './createComponent';

export { addActionHandlers };
export { isolate };
export { logProps };
export { mapActions };
export { mapProps };
export { withActions };
export { withProps };

export { reduxSinkCombiner };
export { mergeReduxSinks };
export default createComponent;

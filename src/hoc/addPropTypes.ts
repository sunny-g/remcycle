import { of } from 'most';
import { hold } from '@most/hold';
import mapSources from '@sunny-g/cycle-utils/es2015/mapSources';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import PropTypes from 'prop-types';
import mapPropsStream from './mapPropsStream';
import { isProd, mapObj } from '../util';

const addPropTypes = (name, propTypes = {}): HigherOrderComponent =>
  mapPropsStream(propsSource => isProd()
    ? propsSource
    : propsSource
      .tap(props => {
        try {
          PropTypes.checkPropTypes(propTypes, props, 'prop', name);
        } catch (_) {}
      }),
  );

export default addPropTypes;

import { of } from 'most';
import { hold } from '@most/hold';
import mapSinks from '@sunny-g/cycle-utils/es2015/mapSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/src/interfaces';
import PropTypes from 'prop-types';
import { isProd, mapObj } from '../util';

const addActionTypes = (componentName, actionTypes = {}): HigherOrderComponent =>
  mapSinks('REDUX', (REDUX = of({})) => ({
    REDUX: isProd() ? REDUX : REDUX
      .map(mapObj((action$, actionType) => !actionTypes.hasOwnProperty(actionType)
        ? action$
        : action$
          .tap(({ payload }) => {
            try {
              PropTypes.checkPropTypes(actionTypes, { [actionType]: payload }, 'action payload', componentName)
            } catch (_) {}
          }),
      )),
  }));

export default addActionTypes;

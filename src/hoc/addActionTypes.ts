import { of } from 'most';
import { hold } from '@most/hold';
import mapSinks from '@sunny-g/cycle-utils/es2015/mapSinks';
import { HigherOrderComponent } from '@sunny-g/cycle-utils/es2015/interfaces';
import PropTypes from 'prop-types';
import { isProd, mapObj } from '../util';

const addActionTypes = (name, actionTypes = {}): HigherOrderComponent =>
  mapSinks('REDUX', (REDUX = of({})) => ({
    REDUX: isProd() ? REDUX : REDUX
      .map(mapObj((action$, actionType) =>
        actionTypes.hasOwnProperty(actionType)
          ? action$.tap(({ payload }) => {
              try {
                PropTypes.checkPropTypes(actionTypes, { [actionType]: payload }, 'prop', name)
              } catch (_) {}
          })
          : action$
      ))
      .thru(hold),
  }));

export default addActionTypes;

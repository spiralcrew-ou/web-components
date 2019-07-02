import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ethServiceProvider, uprtclMultiplatform } from '../../services';
import { UserState } from './reducer';

export const SET_ETH_ACCOUNT = 'SET_ETH_ACCOUNT';

export interface SetEthAccount extends Action<'SET_ETH_ACCOUNT'> {
  ethAccount: string;
}

export type UserAction = SetEthAccount;

type ThunkResult<T> = ThunkAction<T, UserState, undefined, UserAction>;

const ethConnection =
  uprtclMultiplatform.serviceProviders[ethServiceProvider].service['ethereum'];

export const getEthAccount: ActionCreator<
  ThunkResult<Promise<string>>
> = () => async dispatch => {
  await ethConnection.ready();

  const ethAccount = ethConnection.account;

  await dispatch({ type: SET_ETH_ACCOUNT, ethAccount });
  return ethAccount;
};

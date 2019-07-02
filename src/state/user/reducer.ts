import { Reducer } from 'redux';
import { UserAction, SET_ETH_ACCOUNT } from './actions';

export interface UserState {
  ethAccount: string;
  creatorId: string;
}

const initialState: UserState = {
  ethAccount: '',
  creatorId: ''
};

export const userReducer: Reducer<UserState, UserAction> = (
  state: UserState = initialState,
  action: UserAction
) => {
  switch (action.type) {
    case SET_ETH_ACCOUNT:
      return {
        ...state,
        ethAccount: action.ethAccount,
        creatorId: action.ethAccount
      };
    default:
      return state;
  }
};

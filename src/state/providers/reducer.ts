import { Reducer } from 'redux';
import {
  ProvidersAction,
  SET_AVAILABLE_PROVIDERS,
  SET_SELECTED_PROVIDER
} from './actions';

export interface ProvidersState {
  availableProviders: string[];
  selectedProvider: string;
}

const initialState: ProvidersState = {
  availableProviders: [],
  selectedProvider: null
};

export const providersReducer: Reducer<ProvidersState, ProvidersAction> = (
  state: ProvidersState = initialState,
  action: ProvidersAction
) => {
  switch (action.type) {
    case SET_AVAILABLE_PROVIDERS:
      return {
        ...state,
        availableProviders: action.providers
      };
    case SET_SELECTED_PROVIDER:
      return {
        ...state,
        selectedProvider: action.provider
      };
    default:
      return state;
  }
};

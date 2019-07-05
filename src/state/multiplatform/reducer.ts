import { Reducer } from 'redux';
import {
  SET_AVAILABLE_PROVIDERS,
  SET_SELECTED_PROVIDER,
  MultiplatformAction
} from './actions';

export interface MultiplatformState {
  availableProviders: string[];
  selectedProvider: string;
}

const initialState: MultiplatformState = {
  availableProviders: [],
  selectedProvider: null
};

export const multiplatformReducer: Reducer<MultiplatformState, MultiplatformAction> = (
  state: MultiplatformState = initialState,
  action: MultiplatformAction
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

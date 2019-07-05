import { ProvidersState } from './reducer';

export const selectAvailableProviders = (state: ProvidersState) =>
  state.availableProviders;

export const selectSelectedProvider = (state: ProvidersState) =>
  state.selectedProvider;

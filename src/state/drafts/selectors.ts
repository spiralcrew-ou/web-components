import { DraftsState } from './reducer';

export const selectDraft = (elementId: string) => (state: DraftsState) =>
  state.drafts[elementId];

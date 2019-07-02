import { Dictionary } from '../../types';
import { Reducer } from 'redux';
import { DraftAction, SET_DRAFT } from './actions';

export interface DraftsState {
  drafts: Dictionary<any>;
}

const initialState: DraftsState = {
  drafts: {}
};

export const draftsReducer: Reducer<DraftsState, DraftAction> = (
  state: DraftsState = initialState,
  action: DraftAction
) => {
  switch (action.type) {
    case SET_DRAFT:
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.elementId]: action.draft
        }
      };
    default:
      return state;
  }
};

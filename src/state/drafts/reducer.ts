import { Dictionary } from '../../types';
import { Reducer } from 'redux';
import { DraftAction, SET_DRAFT } from './actions';

export interface DraftsState<T> {
  drafts: Dictionary<T>;
}

const initialState: DraftsState<any> = {
  drafts: {}
};

export function configureReducer<T>() {
  const draftsReducer: Reducer<DraftsState<T>, DraftAction> = (
    state: DraftsState<T> = initialState,
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
  return draftsReducer;
}

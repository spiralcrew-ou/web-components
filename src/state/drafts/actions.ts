import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { DraftsState } from './reducer';
import { draftService } from '../../services';

export const SET_DRAFT = 'SET_DRAFT';

export interface SetDraft extends Action<'SET_DRAFT'> {
  elementId: string;
  draft: any;
}

export type DraftAction = SetDraft;

type ThunkResult<T> = ThunkAction<T, DraftsState, undefined, DraftAction>;

export const getDraft: ActionCreator<ThunkResult<Promise<any>>> = (
  elementId: string
) => async dispatch => {
  const draft = await draftService.getDraft(elementId);
  await dispatch({ type: SET_DRAFT, elementId, draft });
  return draft;
};

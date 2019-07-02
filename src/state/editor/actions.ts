import { Action, ActionCreator } from 'redux';
import { EditorState } from './reducer';
import { ThunkAction } from 'redux-thunk';
import { getDraft } from '../drafts/actions';
import { getPerspective, getHead, getCommit } from '../uprtcl/actions';
import { getData } from '../documents/actions';
import { TextNode, Perspective, Commit } from '../../types';

export type EditorAction = Action;

type ThunkResult<T> = ThunkAction<T, EditorState, undefined, EditorAction>;

export const getHeadContent: ActionCreator<
  ThunkResult<
    Promise<{
      head: Commit;
      data: TextNode;
    }>
  >
> = (perspectiveId: string) => async dispatch => {
  const headId = await dispatch(getHead(perspectiveId));
  let head: Commit = null;
  let data: TextNode = null;
  if (headId) {
    head = await dispatch(getCommit(headId));
    if (head) {
      data = await dispatch(getData(head.dataId));
    }
  }
  return { data, head };
};

export const getPerspectiveContent: ActionCreator<
  ThunkResult<
    Promise<{
      draft: any;
      head: Commit;
      data: TextNode;
      perspective: Perspective;
    }>
  >
> = (perspectiveId: string) => async dispatch =>
  Promise.all([
    dispatch(getDraft(perspectiveId)),
    dispatch(getPerspective(perspectiveId)),
    dispatch(getHeadContent(perspectiveId))
  ]).then(result => ({
    draft: result[0],
    perspective: result[1],
    data: result[2].data,
    head: result[2].head
  }));

export const createBlock: ActionCreator<ThunkResult<void>> = (
  blockId: string,
  _content: string,
  parentId: string,
  index: number
) => async (dispatch, getState) => {};

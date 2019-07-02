import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Context, Perspective, Commit, TextNode } from '../../types';
import { UprtclState } from './reducer';
import { uprtclMultiplatform, dataMultiplatform } from '../../services';
import { contexts, perspectives, commits } from './selectors';
import { UprtclService } from '../../services/uprtcl.service';
import { MergeStrategy } from '../../services/merge/merge.strategy';
import { RecursiveContextMergeStrategy } from '../../services/merge/recursive-context.merge.strategry';

export const GET_CONTEXT = 'GET_CONTEXT';
export const GET_CONTEXT_PERSPECTIVES = 'GET_CONTEXT_PERSPECTIVES';
export const GET_PERSPECTIVE = 'GET_PERSPECTIVE';
export const GET_COMMIT = 'GET_COMMIT';

export const GET_HEAD = 'GET_HEAD';

export interface GetContext extends Action<'GET_CONTEXT'> {
  context: Context;
}
export interface GetContextPerspectives
  extends Action<'GET_CONTEXT_PERSPECTIVES'> {
  perspectives: Perspective[];
}
export interface GetPerspective extends Action<'GET_PERSPECTIVE'> {
  perspective: Perspective;
}
export interface GetCommit extends Action<'GET_COMMIT'> {
  commit: Commit;
}

export interface GetHead extends Action<'GET_HEAD'> {
  perspectiveId: string;
  headId: string;
}

export type UprtclAction =
  | GetContext
  | GetContextPerspectives
  | GetPerspective
  | GetCommit
  | GetHead;

type ThunkResult<T> = ThunkAction<T, UprtclState, undefined, UprtclAction>;

const uprtcl: UprtclService = uprtclMultiplatform;
const merge: MergeStrategy<TextNode> = new RecursiveContextMergeStrategy(
  uprtcl,
  dataMultiplatform
);

export const getContext: ActionCreator<ThunkResult<Promise<Context>>> = (
  contextId: string
) => async (dispatch, getState) => {
  const context = await uprtcl.getContext(contextId);

  if (!contexts.selectById(contextId)(getState())) {
    await dispatch({ type: GET_CONTEXT, context: context });
  }
  return context;
};

export const getContextPerspectives: ActionCreator<
  ThunkResult<Promise<Perspective[]>>
> = (contextId: string) => async dispatch => {
  const perspectives = await uprtcl.getContextPerspectives(contextId);
  await dispatch({
    type: GET_CONTEXT_PERSPECTIVES,
    perspectives: perspectives
  });
  return perspectives;
};

export const getPerspective: ActionCreator<
  ThunkResult<Promise<Perspective>>
> = (perspectiveId: string) => async (dispatch, getState) => {
  const perspective = await uprtcl.getPerspective(perspectiveId);

  if (!perspectives.selectById(perspectiveId)(getState())) {
    await dispatch({ type: GET_PERSPECTIVE, perspective: perspective });
  }
  return perspective;
};

export const getCommit: ActionCreator<ThunkResult<Promise<Commit>>> = (
  commitId: string
) => async (dispatch, getState) => {
  const commit = await uprtcl.getCommit(commitId);

  if (!commits.selectById(commitId)(getState())) {
    await dispatch({ type: GET_COMMIT, commit: commit });
  }
  return commit;
};

export const createContext: ActionCreator<ThunkResult<Promise<string>>> = (
  context: Context
) => async dispatch => {
  const contextId = await uprtcl.createContext(context);

  context.id = contextId;
  await dispatch({ type: GET_CONTEXT, context: context });
  return contextId;
};

export const createPerspective: ActionCreator<ThunkResult<Promise<string>>> = (
  perspective: Perspective
) => async dispatch => {
  const perspectiveId = await uprtcl.createPerspective(perspective);

  perspective.id = perspectiveId;
  await dispatch({ type: GET_PERSPECTIVE, perspective: perspective });
  return perspectiveId;
};

export const createCommit: ActionCreator<ThunkResult<Promise<string>>> = (
  commit: Commit
) => async dispatch => {
  const commitId = await uprtcl.createCommit(commit);

  commit.id = commitId;
  await dispatch({ type: GET_COMMIT, commit: commit });
  return commitId;
};

export const updateHead: ActionCreator<ThunkResult<Promise<void>>> = (
  perspectiveId: string,
  headId: string
) => async dispatch => {
  await uprtcl.updateHead(perspectiveId, headId);

  await dispatch({
    type: GET_HEAD,
    perspectiveId: perspectiveId,
    headId: headId
  });
};

export const getHead: ActionCreator<ThunkResult<Promise<string>>> = (
  perspectiveId: string
) => async dispatch => {
  const headId = await uprtcl.getHead(perspectiveId);

  await dispatch({
    type: GET_HEAD,
    perspectiveId: perspectiveId,
    headId: headId
  });
  return headId;
};

export const mergePerspectives: ActionCreator<ThunkResult<Promise<string>>> = (
  toPerspectiveId: string,
  fromPerspectives: string[]
) => async dispatch => {
  const headId = await merge.mergePerspectives(
    toPerspectiveId,
    fromPerspectives
  );
  if (headId) {
    await dispatch(getHead(headId));
  }
  return headId;
};

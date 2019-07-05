import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Context, Perspective, Commit, Dictionary } from '../../types';
import { UprtclState } from './reducer';
import { contexts, perspectives, commits } from './selectors';
import { UprtclService } from '../../services/uprtcl.service';
import { MergeStrategy } from '../../services/merge/merge.strategy';
import { TypedActionCreator } from '../types';
import { Uprtcl } from '../../services/uprtcl';

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

export type UprtclActionCreators = {
  getContext: TypedActionCreator<ThunkResult<Promise<Context>>, {contextId: string}>;
  getContextPerspectives: TypedActionCreator<ThunkResult<Promise<Perspective[]>>>;
  getPerspective: TypedActionCreator<ThunkResult<Promise<Perspective>>>;
  getCommit: TypedActionCreator<ThunkResult<Promise<Commit>>>;
  createContext: TypedActionCreator<ThunkResult<Promise<string>>>;
  createPerspective: TypedActionCreator<ThunkResult<Promise<string>>>;
  createCommit: TypedActionCreator<ThunkResult<Promise<string>>>;
  updateHead: TypedActionCreator<ThunkResult<Promise<void>>>;
  getHead: TypedActionCreator<ThunkResult<Promise<string>>>;
  mergePerspectives: TypedActionCreator<ThunkResult<Promise<string>>>;
}

export function configureActions<D>(
  uprtcl: Uprtcl,
  merge: MergeStrategy<D>
): UprtclActionCreators {
  const getContext = (
    args: {contextId: string}
  ) => async (dispatch, getState) => {
    let context = contexts.selectById(args.contextId)(getState());

    if (!context) {
      context = await uprtcl.getContext(args.contextId);
      await dispatch({ type: GET_CONTEXT, context: context });
    }

    return context;
  };

  const getContextPerspectives: ActionCreator<
    ThunkResult<Promise<Perspective[]>>
  > = (contextId: string) => async dispatch => {
    const perspectives = await uprtcl.getContextPerspectives(contextId);
    await dispatch({
      type: GET_CONTEXT_PERSPECTIVES,
      perspectives: perspectives
    });
    return perspectives;
  };

  const getPerspective: ActionCreator<ThunkResult<Promise<Perspective>>> = (
    perspectiveId: string
  ) => async (dispatch, getState) => {
    let perspective = perspectives.selectById(perspectiveId)(getState());

    if (!perspective) {
      perspective = await uprtcl.getPerspective(perspectiveId);
      await dispatch({ type: GET_PERSPECTIVE, perspective: perspective });
    }

    return perspective;
  };

  const getCommit: ActionCreator<ThunkResult<Promise<Commit>>> = (
    commitId: string
  ) => async (dispatch, getState) => {
    let commit = commits.selectById(commitId)(getState());

    if (!commit) {
      commit = await uprtcl.getCommit(commitId);
      await dispatch({ type: GET_COMMIT, commit: commit });
    }

    return commit;
  };

  const createContext: ActionCreator<ThunkResult<Promise<string>>> = (
    context: Context
  ) => async dispatch => {
    const contextId = await uprtcl.createContext(context);

    context.id = contextId;
    await dispatch({ type: GET_CONTEXT, context: context });
    return contextId;
  };

  const createPerspective: ActionCreator<ThunkResult<Promise<string>>> = (
    perspective: Perspective
  ) => async dispatch => {
    const perspectiveId = await uprtcl.createPerspective(perspective);
    
    perspective.id = perspectiveId;
    await dispatch({ type: GET_PERSPECTIVE, perspective: perspective });
    return perspectiveId;
  };
  
  const fork = () => async dispatch => {
    
        uprtcl.fork('')

  }

  const createCommit: ActionCreator<ThunkResult<Promise<string>>> = (
    commit: Commit
  ) => async dispatch => {
    const commitId = await uprtcl.createCommit(commit);

    commit.id = commitId;
    await dispatch({ type: GET_COMMIT, commit: commit });
    return commitId;
  };

  const updateHead: ActionCreator<ThunkResult<Promise<void>>> = (
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

  const getHead: ActionCreator<ThunkResult<Promise<string>>> = (
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

  const mergePerspectives: ActionCreator<ThunkResult<Promise<string>>> = (
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

  return {
    getContext,
    getContextPerspectives,
    getPerspective,
    getCommit,
    createContext,
    createPerspective,
    createCommit,
    updateHead,
    getHead,
    mergePerspectives
  };
}

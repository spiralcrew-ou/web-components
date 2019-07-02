import { Action, ActionCreator } from 'redux';
import { Commit, Context, Perspective } from '../../types';
import { ThunkAction } from 'redux-thunk';
import { ProvidersState } from './reducer';
import { uprtclMultiplatform } from '../../services';
import {
  GET_CONTEXT,
  UprtclAction,
  GET_PERSPECTIVE,
  GET_COMMIT
} from '../uprtcl/actions';

export const SET_AVAILABLE_PROVIDERS = 'SET_AVAILABLE_PROVIDERS';
export const SET_SELECTED_PROVIDER = 'SET_SELECTED_PROVIDER';

export interface SetAvailableProviders
  extends Action<'SET_AVAILABLE_PROVIDERS'> {
  providers: string[];
}

export interface SetSelectedProvider extends Action<'SET_SELECTED_PROVIDER'> {
  provider: string;
}

export type ProvidersAction =
  | SetAvailableProviders
  | SetSelectedProvider
  | UprtclAction;

type ThunkResult<T> = ThunkAction<
  T,
  ProvidersState,
  undefined,
  ProvidersAction
>;

export const createContextIn: ActionCreator<ThunkResult<Promise<string>>> = (
  serviceProvider: string,
  context: Context
) => async dispatch => {
  const contextId = await uprtclMultiplatform.createContextIn(
    serviceProvider,
    context
  );

  context.id = contextId;
  await dispatch({ type: GET_CONTEXT, context: context });
  return contextId;
};

export const createPerspectiveIn: ActionCreator<
  ThunkResult<Promise<string>>
> = (
  serviceProvider: string = null,
  perspective: Perspective
) => async dispatch => {
  const perspectiveId = await uprtclMultiplatform.createPerspectiveIn(
    serviceProvider,
    perspective
  );

  perspective.id = perspectiveId;
  await dispatch({ type: GET_PERSPECTIVE, perspective: perspective });
  return perspectiveId;
};

export const createCommitIn: ActionCreator<ThunkResult<Promise<string>>> = (
  serviceProvider: string = null,
  commit: Commit
) => async dispatch => {
  const commitId = await uprtclMultiplatform.createCommitIn(
    serviceProvider,
    commit
  );

  commit.id = commitId;
  await dispatch({ type: GET_COMMIT, commit: commit });
  return commitId;
};

export const pullPerspective: ActionCreator<ThunkResult<Promise<string>>> = (
  perspectiveId: string
) => async dispatch => {
  
};

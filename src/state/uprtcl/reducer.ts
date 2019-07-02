import { EntityState, createEntityAdapter } from '../entity';
import { Context, Commit, Perspective, Dictionary } from '../../types';
import { Reducer } from 'redux';
import {
  UprtclAction,
  GET_CONTEXT,
  GET_CONTEXT_PERSPECTIVES,
  GET_COMMIT,
  GET_PERSPECTIVE,
  GET_HEAD
} from './actions';

export interface UprtclState {
  contexts: EntityState<Context>;
  perspectives: EntityState<Perspective>;
  commits: EntityState<Commit>;
  heads: Dictionary<string>;
}

export const adapters = {
  contexts: createEntityAdapter<Context>(),
  perspectives: createEntityAdapter<Perspective>(),
  commits: createEntityAdapter<Commit>()
};

const initialState: UprtclState = {
  contexts: adapters.contexts.getInitialState(),
  perspectives: adapters.perspectives.getInitialState(),
  commits: adapters.commits.getInitialState(),
  heads: {}
};

export const uprtclReducer: Reducer<UprtclState, UprtclAction> = (
  state: UprtclState = initialState,
  action: UprtclAction
) => {
  switch (action.type) {
    case GET_CONTEXT:
      return {
        ...state,
        contexts: adapters.contexts.insertOne(action.context, state.contexts)
      };

    case GET_CONTEXT_PERSPECTIVES:
      return {
        ...state,
        perspectives: adapters.perspectives.insertMany(
          action.perspectives,
          state.perspectives
        )
      };

    case GET_PERSPECTIVE:
      return {
        ...state,
        perspectives: adapters.perspectives.insertOne(
          action.perspective,
          state.perspectives
        )
      };

    case GET_COMMIT:
      return {
        ...state,
        commits: adapters.commits.insertOne(action.commit, state.commits)
      };

    case GET_HEAD:
      return {
        ...state,
        heads: {
          ...state.heads,
          [action.perspectiveId]: action.headId
        }
      };

    default:
      return state;
  }
};

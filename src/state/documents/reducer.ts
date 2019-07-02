import { TextNode } from '../../types';
import { Reducer } from 'redux';
import { GET_DATA, DocumentAction } from './actions';
import { EntityState, createEntityAdapter } from '../entity';

export interface DocumentsState {
  nodes: EntityState<TextNode>;
}

export const nodesAdapter = createEntityAdapter<TextNode>();

const initialState: DocumentsState = {
  nodes: nodesAdapter.getInitialState()
};

export const documentsReducer: Reducer<DocumentsState, DocumentAction> = (
  state: DocumentsState = initialState,
  action: DocumentAction
) => {
  switch (action.type) {
    case GET_DATA:
      return {
        ...state,
        nodes: nodesAdapter.insertOne(action.node, state.nodes)
      };
    default:
      return state;
  }
};

import { Reducer } from 'redux';
import { EditorAction } from './actions';

export interface EditorState {}

const initialState: EditorState = {};

export const editorReducer: Reducer<EditorState, EditorAction> = (
  state: EditorState = initialState,
  action: EditorAction
) => {
  switch (action.type) {
    default:
      return state;
  }
};

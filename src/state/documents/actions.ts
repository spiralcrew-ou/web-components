import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { DocumentsState } from './reducer';
import { dataMultiplatform } from '../../services';
import { TextNode } from '../../types';

export const GET_DATA = 'GET_DATA';

export interface GetData extends Action<'GET_DATA'> {
  node: TextNode;
}

export type DocumentAction = GetData;

type ThunkResult<T> = ThunkAction<T, DocumentsState, undefined, DocumentAction>;

export const getData: ActionCreator<ThunkResult<Promise<TextNode>>> = (
  dataId: string
) => async dispatch => {
  const node = await dataMultiplatform.getData<TextNode>(dataId);
  node['id'] = dataId;
  await dispatch({ type: GET_DATA, node });
  return node;
};

export const createData: ActionCreator<ThunkResult<Promise<string>>> = (
  node: TextNode
) => async dispatch => {
  const dataId = await dataMultiplatform.createData(node);
  node.id = dataId;
  await dispatch({ type: GET_DATA, node });
  return dataId;
};

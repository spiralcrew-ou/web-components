import { nodesAdapter, DocumentsState } from './reducer';

export const nodes = nodesAdapter.selectors(
  (state: DocumentsState) => state.nodes
);

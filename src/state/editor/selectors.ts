import { RootState } from '../store';
import { Block, TextNode, NodeType, Commit } from '../../types';
import { perspectives, commits, selectHead } from '../uprtcl/selectors';
import { selectDraft } from '../drafts/selectors';
import { nodes } from '../documents/selectors';

export const selectPerspectiveData = (perspectiveId: string) => (
  state: RootState
) => {
  const headId = selectHead(perspectiveId)(state.uprtcl);

  let head: Commit = null;
  let data: TextNode = null;
  if (headId) {
    head = commits.selectById(headId)(state.uprtcl);
    if (head) {
      data = nodes.selectById(head.dataId)(state.documents);
    }
  }
  const draft = selectDraft(perspectiveId)(state.drafts);
  return {
    data: draft ? <TextNode>draft : data,
    status: draft ? 'DRAFT' : 'COMMITED'
  }
};

export const selectBlock = (perspectiveId: string) => (state: RootState) => {
  const perspective = perspectives.selectById(perspectiveId)(state.uprtcl);

  const data = selectPerspectiveData(perspectiveId)(state);
  
  const block: Block = {
    id: perspectiveId,
    status: data.status,
    children: data.data.links.map(link => link.link),
    content: data.data.text,
    creatorId: perspective.creatorId,
    serviceProvider: perspective.origin,
    style: data.data ? NodeType[data.data.type] : NodeType.paragraph
  };

  return block;
};

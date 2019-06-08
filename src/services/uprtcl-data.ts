import { uprtclMultiplatform, dataMultiplatform } from './index';
import { PerspectiveFull, CommitFull, TextNodeFull, TextNode } from './../types';

export class UprtclData {

  uprtcl = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async getPerspectiveFull(perspectiveId: string): Promise<PerspectiveFull> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const perspectiveFull = new PerspectiveFull()

    const draft = await this.dataService.getDraft(perspective.origin, perspectiveId);

    perspectiveFull.id = perspective.id
    perspectiveFull.origin = perspective.origin
    perspectiveFull.creatorId = perspective.creatorId
    perspectiveFull.timestamp = perspective.timestamp
    perspectiveFull.context = await this.uprtcl.getContext(perspective.contextId)
    perspectiveFull.name = perspective.name
    perspectiveFull.draft = await this.getTextNodeFull(draft);
    perspectiveFull.head = await this.getCommitFull(perspective.headId);

    return perspectiveFull;
  }

  async getCommitFull(commitId: string): Promise<CommitFull> {
    const commit = await this.uprtcl.getCommit(commitId);
    if (!commit) return null;

    const data = await this.dataService.getData(commit.dataId);

    const commitFull = new CommitFull();

    commitFull.id = commit.id;
    commitFull.creatorId = commit.creatorId;
    commitFull.timestamp = commit.timestamp;
    commitFull.message = commit.message;

    for (let i=0; i<commit.parentsIds.length; i++) {
      const parent = await this.getCommitFull(commit.parentsIds[0]);
      if (commitFull.parents) commitFull.parents.push(parent);
    }

    commitFull.data = await await this.getTextNodeFull(data);
    
    return commitFull;
  }

  async getTextNodeFull(textNode: TextNode): Promise<TextNodeFull> {
    const textNodeFull = new TextNodeFull();

    textNodeFull.id = textNode.id;
    textNodeFull.text = textNode.text;

    for (let i=0; i<textNode.links.length; i++) {
      const linkedPerspective = await this.getPerspectiveFull(textNode.links[i].link);
      if (textNodeFull.links) textNodeFull.links.push({
        link: linkedPerspective, 
        position: textNode.links[i].position
      });
    }

    return textNodeFull;
  }
}

export const uprtclData = new UprtclData();
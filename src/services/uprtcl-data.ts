import { uprtclMultiplatform, dataMultiplatform } from './index';
import { PerspectiveFull, CommitFull, TextNodeFull, TextNode } from './../types';

export class UprtclData {

  uprtcl = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async getPerspectiveFull(perspectiveId: string, levels: number): Promise<PerspectiveFull> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const perspectiveFull = new PerspectiveFull()

    const draft = await this.dataService.getDraft(perspective.origin, perspectiveId);

    perspectiveFull.id = perspective.id
    perspectiveFull.origin = perspective.origin
    perspectiveFull.creatorId = perspective.creatorId
    perspectiveFull.timestamp = perspective.timestamp
    perspectiveFull.context = await this.uprtcl.getContext(perspective.contextId)
    perspectiveFull.name = perspective.name
    perspectiveFull.draft = await this.getTextNodeFull(draft, levels);
    perspectiveFull.head = await this.getCommitFull(perspective.headId, levels);

    return perspectiveFull;
  }

  async getCommitFull(commitId: string, levels: number): Promise<CommitFull> {
    const commit = await this.uprtcl.getCommit(commitId);
    if (!commit) return null;

    const data = await this.dataService.getData(commit.dataId);

    const commitFull = new CommitFull();

    commitFull.id = commit.id;
    commitFull.creatorId = commit.creatorId;
    commitFull.timestamp = commit.timestamp;
    commitFull.message = commit.message;
    commitFull.parentsIds = commit.parentsIds;
    
    commitFull.data = await await this.getTextNodeFull(data, levels);
    
    return commitFull;
  }

  async getTextNodeFull(textNode: TextNode, levels: number): Promise<TextNodeFull> {
    if (textNode == null) return null;
    
    const textNodeFull = new TextNodeFull();

    textNodeFull.id = textNode.id;
    textNodeFull.text = textNode.text;

    if (levels == 0) {
      /** stop recursion */
      textNodeFull.links = [];
      return textNodeFull
    }

    for (let i=0; i<textNode.links.length; i++) {
      const linkedPerspective = await this.getPerspectiveFull(textNode.links[i].link, levels - 1);
      if (textNodeFull.links) textNodeFull.links.push({
        link: linkedPerspective, 
        position: textNode.links[i].position
      });
    }

    return textNodeFull;
  }

  async createGlobalPerspective(
    serviceProvider: string, 
    perspectiveId: string,
    name: string) : Promise<string> {

      /** get perspective and include first level links */
      const perspective = await this.uprtcl.getPerspective(perspectiveId);
      const head = await this.uprtcl.getCommit(perspective.headId);
      const data = await this.dataService.getData(head.dataId);
      
      /** global perspectives are created bottom-up in the tree of 
       * perspectives */
      const links = data.links;
      let newLinks = [...links];

      for (let i=0; i<links.length; i++) {
        const childPerspectiveId = links[i].link;
        
        /** recursively create a new global perspective of the child */
        const childNewPerspectiveId = await this.createGlobalPerspective(
          serviceProvider, childPerspectiveId, name);

        newLinks[i].link = childNewPerspectiveId;
      }

      /** a new commit is created to point to the new perspectives
       * of the children that were just created */

      let newCommit = null;

      if (links.length > 0) {
        let newNode = {
          text: data.text,
          links: newLinks
        }
  
        const newDataId = await this.dataService.createData(serviceProvider, newNode);
  
        newCommit = await this.uprtcl.createCommit(
          serviceProvider, 
          Date.now(), 
          `creating new global perspective ${name}`,
          [ head.id ],
          newDataId)
      }
            
      return this.uprtcl.createPerspective(
        serviceProvider,
        perspective.contextId,
        name,
        Date.now(),
        newCommit
      );
  }
}

export const uprtclData = new UprtclData();
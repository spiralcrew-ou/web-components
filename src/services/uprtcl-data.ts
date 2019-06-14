import { uprtclMultiplatform, dataMultiplatform } from './index';
import { PerspectiveFull, CommitFull, TextNodeFull, TextNode as ITextNode } from './../types';
import { TextNode } from './../objects';

export class UprtclData {
  
  uprtcl = uprtclMultiplatform;
  data = dataMultiplatform;

  /** -----------------------------------------------------------------
   * DIRECT ACCESS TO ALL UPRTCL AND DATA SERVICES
   * ------------------------------------------------------------------
  */
  getContext(contextId: string): Promise<import("../types").Context> {
    return this.uprtcl.getContext(contextId);
  }
  getPerspective(perspectiveId: string): Promise<import("../types").Perspective> {
    return this.uprtcl.getPerspective(perspectiveId);
  }
  getCommit(commitId: string): Promise<import("../types").Commit> {
    return this.uprtcl.getCommit(commitId);
  }
  getRootContextId(serviceProvider: string): Promise<string> {
    return this.uprtcl.getRootContextId(serviceProvider);
  }
  getContextPerspectives(contextId: string): Promise<import("../types").Perspective[]> {
    return this.uprtcl.getContextPerspectives(contextId);
  }
  createContext(serviceProvider: string, timestamp: number, nonce: number): Promise<string> {
    return this.uprtcl.createContext(serviceProvider,timestamp, nonce);
  }
  createPerspective(serviceProvider: string, contextId: string, name: string, timestamp: number, headId: string): Promise<string> {
    return this.uprtcl.createPerspective(serviceProvider, contextId, name, timestamp, headId);
  }
  createCommit(serviceProvider: string, timestamp: number, message: string, parentsIds: string[], dataId: string): Promise<string> {
    return this.uprtcl.createCommit(serviceProvider, timestamp, message, parentsIds, dataId);
  }
  cloneContext(serviceProvider: string, context: import("../types").Context): Promise<string> {
    return this.uprtcl.cloneContext(serviceProvider, context);
  }
  clonePerspective(serviceProvider: string, perspective: import("../types").Perspective): Promise<string> {
    return this.uprtcl.clonePerspective(serviceProvider, perspective);
  }
  cloneCommit(serviceProvider: string, commit: import("../types").Commit): Promise<string> {
    return this.uprtcl.cloneCommit(serviceProvider, commit);
  }
  updateHead(perspectiveId: string, commitId: string): Promise<void> {
    return this.uprtcl.updateHead(perspectiveId, commitId);
  }
  getData(dataId: string): Promise<any> {
    return this.data.getData(dataId);
  }
  createData(serviceProvider: string, data: any): Promise<string> {
    return this.data.createData(serviceProvider, data);
  }

  /** -----------------------------------------------------------------
   * ADDITIONAL HELPER FUNCTIONS THAT COMBINE UPRTCL AND DATA SERVICES
   * ------------------------------------------------------------------
  */
  
  /** Gets a PerspectiveFull object with the head, context and draft objects nested. 
   * It may recurse if the head commit or the draft have a TextNode with links, getting 
   * their content as PerspectiveFull recursively.
   * 
   * @param perspectiveId the perspective id.
   * 
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   * 
   * @returns A PerspectiveFull with a head, context and draft objects nested. */
  async getPerspectiveFull(perspectiveId: string, levels: number): Promise<PerspectiveFull> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const perspectiveFull = new PerspectiveFull()

    const draft = await this.data.getDraft(perspective.origin, perspectiveId);
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

  /** Gets a CommitFull object with the TextNode object nested. It may recurse if
   * the TextNode has links, getting their head and data.
   * 
   * @param commitId the commit id.
   * 
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   * 
   * @returns A CommitFull with a TextNodeFull object nested . */
  async getCommitFull(commitId: string, levels: number): Promise<CommitFull> {
    const commit = await this.uprtcl.getCommit(commitId);
    if (!commit) return null;

    const commitFull = new CommitFull();

    commitFull.id = commit.id;
    commitFull.creatorId = commit.creatorId;
    commitFull.timestamp = commit.timestamp;
    commitFull.message = commit.message;
    commitFull.parentsIds = commit.parentsIds;

    // TODO: why is the data read here and not inside getTextNodeFull? not sure
    const data = await this.data.getData(commit.dataId);
    commitFull.data = await this.getTextNodeFull(data, levels);

    return commitFull;
  }

  /** Fills an existing TextNode with perspectives in place of the links.
   * 
   * @param textNode the plain TextNode
   * 
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   * 
   * @returns A TextNodeFull with perspectives in place of links. */
  async getTextNodeFull(textNode: ITextNode, levels: number): Promise<TextNodeFull> {
    if (textNode == null) return null;

    const textNodeFull = new TextNodeFull();

    textNodeFull.id = textNode.id;
    textNodeFull.text = textNode.text;

    if (levels == 0) {
      /** stop recursion */
      textNodeFull.links = [];
      return textNodeFull
    }

    for (let i = 0; i < textNode.links.length; i++) {
      const linkedPerspective = await this.getPerspectiveFull(textNode.links[i].link, levels - 1);
      if (textNodeFull.links) textNodeFull.links.push({
        link: linkedPerspective,
        position: textNode.links[i].position
      });
    }

    return textNodeFull;
  }

  /** Recursively creates a new perspective out of an existing perspective 
   * and of all its children, adding a new commit to each parent to 
   * update its links to point to the new perspectives of its children contexts 
   * 
   * @param serviceProvider The service provider in which all the new objects
   * will be created (new perspectives and commits).
   * 
   * @param perspectiveId The Id of the root perspective that will be branched.
   * 
   * @param name The name used for all the new perspectives of the root and the 
   * children.
   * 
   * @returns The id of the new perspective of the root perspective. */
  async createGlobalPerspective(
    serviceProvider: string,
    perspectiveId: string,
    name: string): Promise<string> {

    /** get perspective and include first level links */
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const head = perspective.headId ? await this.uprtcl.getCommit(perspective.headId) : null;
    const data = head ? await this.data.getData(head.dataId) : null;

    /** global perspectives are created bottom-up in the tree of 
     * perspectives */
    const links = data ? data.links : [];
    let newLinks = JSON.parse(JSON.stringify(links));

    for (let i = 0; i < links.length; i++) {
      const childPerspectiveId = links[i].link;

      /** recursively create a new global perspective of the child */
      const childNewPerspectiveId = await this.createGlobalPerspective(
        serviceProvider, childPerspectiveId, name);

      newLinks[i].link = childNewPerspectiveId;
    }

    /** a new commit is created to point to the new perspectives
     * of the children that were just created */
    let newCommit = perspective.headId;

    if (links.length > 0) {
      let newNode = {
        text: data.text,
        type: data.type,
        links: newLinks
      }

      const newDataId = await this.data.createData(serviceProvider, newNode);

      newCommit = await this.uprtcl.createCommit(
        serviceProvider,
        Date.now(),
        `creating new global perspective ${name}`,
        [head.id],
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

  /** Creates a new context, perspective, and a draft combo 
   * 
   * @param serviceProvider The service provider in which all the new objects
   * will be created (new perspectives and commits).
   * 
   * @param content An optional string used to intialize the draft.
   * 
   * @returns The id of the new **perspective**. 
  */
 async initContext(
  serviceProvider: string,
  content: string): Promise<string> {

  const contextId = await this.uprtcl.createContext(
    serviceProvider, Date.now(), 0
  );

  return this.initPerspective(
    serviceProvider,
    contextId,
    content);
  }

  /** Creates a new context, perspective, and a draft combo 
   * 
   * @param serviceProvider The service provider in which all the new objects
   * will be created.
   * 
   * @param contextId The context id of the initiative (cant be null).
   * 
   * @param content An optional string used to intialize the draft.
   * 
   * @returns The id of the new **perspective** of the context. 
  */
  async initPerspective(
    serviceProvider: string,
    contextId: string,
    content: string): Promise<string> {

    const perspectiveId = await this.uprtcl.createPerspective(
      serviceProvider,
      contextId,
      'master',
      Date.now(),
      null
    );

    await this.data.setDraft(
      serviceProvider,
      perspectiveId,
      new TextNode(content, [])
    );

    return perspectiveId;
  }

  /** Creates a new context, perspective, and draft combo using this.initContext() 
   * and adds it as a children of **an existing perspective** at a given index.
   * 
   * @param serviceProvider The service provider in which all the new objects
   * will be created.
   * 
   * @param perspectiveId The perspective used as reference point.
   * 
   * @param index The index in which the new perspective should be added as a child. 
   * `index = -1` can be used to add it as the last children.
   * 
   * @param content An optional string used to intialize the draft of the new
   * perspective.
   * 
   * @returns The id of the new **perspective**. 
  */
  async initContextUnder(
    serviceProvider: string,
    perspectiveId: string,
    index: number,
    content: string): Promise<string> {

    const newPerspectiveId = await this.initContext(serviceProvider, content);
    await this.insertPerspective(serviceProvider, perspectiveId, newPerspectiveId, index)
    return newPerspectiveId;
  }

  /** Inserts an existing perspective (the child) as a child of another existing 
   * perspective (the parent) on a given position.
   * 
   * @param serviceProvider The service provider storing the draft of the parent 
   * perspective. (The child perspective can come from another provider).
   * 
   * @param perspectiveId The parent perspective id.
   * 
   * @param index The index in which the child perspective should be added. 
   * `index = -1` can be used to add it as the last children.
   * 
   * @param content An optional string used to intialize the draft of the child
   * perspective.
   * 
   * @returns The id of the new child **perspective**. 
  */
  async insertPerspective(
    serviceProvider: string,
    onPerspectiveId: string,
    perspectiveId: string,
    index: number): Promise<void> {

    let draft = await this.getOrCreateDraft(serviceProvider, onPerspectiveId);
    
    if (index != -1) {
      if ((0 < index) && (index < draft.links.length)) {
        draft.links.splice(index, 0, { link: perspectiveId });
      } else if (index == draft.links.length){
        /* accept length as index and interpret as push */
        draft.links.push({ link: perspectiveId });
      }
    } else {
      draft.links.push({ link: perspectiveId });
    }

    await this.data.setDraft(serviceProvider, onPerspectiveId, draft);

    return;
  }


  /** Getter function to get or create a draft of/on a given perspective.
   * 
   * @param serviceProvider The service provider from which the draft is to be retrieved.
   * 
   * @param perspectiveId The parent perspective id.
   * 
   * @returns The draft object. 
  */
  async getOrCreateDraft(
    serviceProvider: string,
    perspectiveId: string): Promise<ITextNode> {

    let draft = await this.data.getDraft(serviceProvider, perspectiveId);

    if (draft != null) {
      return draft;
    }

    await this.data.setDraft(
      serviceProvider, perspectiveId, new TextNode('', []));

    return this.data.getDraft(serviceProvider, perspectiveId);
  }

  /** Commits the current draft as the head of the perspective and sets the draft 
   * as null. Do the same, recursively, for all the children perspectives.
   * 
   * @param draftServiceProvider The service provider from which the draft to be commited
   * is to be read (can be a different provider than the one in which the commit is going to
   * be created).
   * 
   * @param serviceProvider The service provider
   * 
   * @param perspectiveId The perspective id.
  */
  async commitGlobal(
    draftServiceProvider: string,
    serviceProvider: string,
    perspectiveId: string,
    message: string,
    timestamp: number) {

    timestamp = timestamp ? timestamp : Date.now();
    message = message ? message : '';

    const draft = await this.data.getDraft(draftServiceProvider, draftServiceProvider);
    const dataId = await this.data.createData(serviceProvider, draft);

    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const parentsIds = [ perspective.headId ];
    const commitId = await this.uprtcl.createCommit(
      serviceProvider,
      timestamp,
      message,
      parentsIds,
      dataId
    );

    await this.uprtcl.updateHead(perspectiveId, commitId);
  }

}

export const uprtclData = new UprtclData();
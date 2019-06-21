import { uprtclMultiplatform, dataMultiplatform } from './index';
<<<<<<< HEAD
import {
  PerspectiveFull,
  CommitFull,
  TextNodeFull,
  TextNode,
  Perspective,
  Context,
  Commit
} from './../types';

export class UprtclData {
  uprtcl = uprtclMultiplatform;
  data = dataMultiplatform;

  /** Single point to initialize empty text nodes
   * 
   * @param _content Text used to initialize the text node
    */
  public initEmptyTextNode(_content: string) :TextNode {
    return {
      text: _content, 
      type: 'paragraph', 
      links: []
    }
  }

  
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
  async getPerspectiveFull(
    perspectiveId: string,
    levels: number
  ): Promise<PerspectiveFull> {
=======
import { 
  PerspectiveFull, CommitFull, TextNodeFull, TextNode as ITextNode,
  Perspective, Context, Commit } from './../types';
import { TextNode } from './../objects';

export class UprtclData {
  
  uprtcl = uprtclMultiplatform;
  data = dataMultiplatform;

  /** -----------------------------------------------------------------
   * DIRECT ACCESS TO ALL UPRTCL AND DATA SERVICES
   * ------------------------------------------------------------------
  */
  getContext(contextId: string): Promise<Context> {
    return this.uprtcl.getContext(contextId);
  }
  getPerspective(perspectiveId: string): Promise<Perspective> {
    return this.uprtcl.getPerspective(perspectiveId);
  }
  getCommit(commitId: string): Promise<Commit> {
    return this.uprtcl.getCommit(commitId);
  }
  getRootContextId(serviceProvider: string): Promise<string> {
    return this.uprtcl.getRootContextId(serviceProvider);
  }
  getContextPerspectives(contextId: string): Promise<Perspective[]> {
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
  cloneContext(serviceProvider: string, context: Context): Promise<string> {
    return this.uprtcl.cloneContext(serviceProvider, context);
  }
  clonePerspective(serviceProvider: string, perspective: Perspective): Promise<string> {
    return this.uprtcl.clonePerspective(serviceProvider, perspective);
  }
  cloneCommit(serviceProvider: string, commit: Commit): Promise<string> {
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
>>>>>>> redux-support
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const headId = await this.uprtcl.getHead(perspectiveId);
    const perspectiveFull = new PerspectiveFull();

    const draft = await this.data.getDraft(perspective.origin, perspectiveId);
<<<<<<< HEAD
    perspectiveFull.id = perspective.id;
    perspectiveFull.origin = perspective.origin;
    perspectiveFull.creatorId = perspective.creatorId;
    perspectiveFull.timestamp = perspective.timestamp;
    perspectiveFull.context = await this.uprtcl.getContext(
      perspective.contextId
    );
    perspectiveFull.name = perspective.name;
=======
    perspectiveFull.id = perspective.id
    perspectiveFull.origin = perspective.origin
    perspectiveFull.creatorId = perspective.creatorId
    perspectiveFull.timestamp = perspective.timestamp
    perspectiveFull.context = await this.uprtcl.getContext(perspective.contextId)
    perspectiveFull.name = perspective.name
>>>>>>> redux-support
    perspectiveFull.draft = await this.getTextNodeFull(draft, levels);
    perspectiveFull.head = await this.getCommitFull(headId, levels);

    return perspectiveFull;
  }

  /** Gets a CommitFull object with the TextNode object nested. It may recurse if
   * the TextNode has links, getting their head and data.
<<<<<<< HEAD
   *
   * @param commitId the commit id.
   *
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   *
=======
   * 
   * @param commitId the commit id.
   * 
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   * 
>>>>>>> redux-support
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
<<<<<<< HEAD
   *
   * @param textNode the plain TextNode
   *
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   *
   * @returns A TextNodeFull with perspectives in place of links. */
  async getTextNodeFull(
    textNode: TextNode,
    levels: number
  ): Promise<TextNodeFull> {
=======
   * 
   * @param textNode the plain TextNode
   * 
   * @param levels The recursion levels (only get links if `levels > 0`). Will get
   * links of links if `levels = 1`, links of links of links if `levels = 2` and so on.
   * If `levels = -1` the recursion is infinite.
   * 
   * @returns A TextNodeFull with perspectives in place of links. */
  async getTextNodeFull(textNode: ITextNode, levels: number): Promise<TextNodeFull> {
>>>>>>> redux-support
    if (textNode == null) return null;

    const textNodeFull = new TextNodeFull();

    textNodeFull.id = textNode.id;
    textNodeFull.text = textNode.text;
    textNodeFull.type = textNode.type;

    if (levels == 0) {
      /** stop recursion */
      textNodeFull.links = [];
      return textNodeFull;
    }

    for (let i = 0; i < textNode.links.length; i++) {
<<<<<<< HEAD
      const linkedPerspective = await this.getPerspectiveFull(
        textNode.links[i].link,
        levels - 1
      );
      if (textNodeFull.links)
        textNodeFull.links.push({
          link: linkedPerspective,
          position: textNode.links[i].position
        });
=======
      const linkedPerspective = await this.getPerspectiveFull(textNode.links[i].link, levels - 1);
      if (textNodeFull.links) textNodeFull.links.push({
        link: linkedPerspective,
        position: textNode.links[i].position
      });
>>>>>>> redux-support
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
<<<<<<< HEAD
    name: string
  ): Promise<string> {
    /** get perspective and include first level links */
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const headId = await this.uprtcl.getHead(perspectiveId);
    const head = headId ? await this.uprtcl.getCommit(headId) : null;
    const data = head ? await this.data.getData(head.dataId) : null;

    /** global perspectives are created bottom-up in the tree of
     * perspectives */
    const links = data ? data.links : [];
    let newLinks = JSON.parse(JSON.stringify(links));

    for (let i = 0; i < links.length; i++) {
      const childPerspectiveId = links[i].link;

      /** recursively create a new global perspective of the child */
      const childNewPerspectiveId = await this.createGlobalPerspective(
        serviceProvider,
        childPerspectiveId,
        name
      );

      newLinks[i].link = childNewPerspectiveId;
    }

    /** a new commit is created to point to the new perspectives
     * of the children that were just created */
    let newCommitId = headId;

    if (links.length > 0) {
      let newNode = {
        text: data.text,
        type: data.type,
        links: newLinks
      };

      const newDataId = await this.data.createData(serviceProvider, newNode);

      const commit: Commit = {
        creatorId: 'anon',
        dataId: newDataId,
        message: `creating new global perspective ${name}`,
        parentsIds: headId ? [headId] : [],
        timestamp: Date.now()
      };

      newCommitId = await this.uprtcl.createCommit(serviceProvider, commit);
    }

    const newPerspective: Perspective = {
      contextId: perspective.contextId,
      name: name,
      creatorId: 'anon',
      origin: serviceProvider,
      timestamp: Date.now()
    };

    const newPerspectiveId = await this.uprtcl.createPerspective(
      serviceProvider,
      newPerspective
    );

    await this.uprtcl.updateHead(newPerspectiveId, newCommitId);
    return newPerspectiveId;
=======
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
>>>>>>> redux-support
  }

  /** Creates a new context, perspective, and a draft combo
   *
   * @param serviceProvider The service provider in which all the new objects
   * will be created (new perspectives and commits).
   *
   * @param content An optional string used to intialize the draft.
<<<<<<< HEAD
   *
   * @returns The id of the new **perspective**.
   */
  async initContext(serviceProvider: string, content: string): Promise<string> {
    const context: Context = {
      creatorId: 'anon',
      nonce: 0,
      timestamp: 0
    };
    const contextId = await this.uprtcl.createContext(serviceProvider, context);

    return this.initPerspective(serviceProvider, contextId, content);
=======
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
>>>>>>> redux-support
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
<<<<<<< HEAD
    content: string
  ): Promise<string> {
    const perspective: Perspective = {
      contextId: contextId,
      name: 'master',
      creatorId: 'anon',
      origin: serviceProvider,
      timestamp: Date.now()
    };

=======
    content: string): Promise<string> {
>>>>>>> redux-support
    const perspectiveId = await this.uprtcl.createPerspective(
      serviceProvider,
      perspective
    );

    await this.data.setDraft(
      serviceProvider,
      perspectiveId,
<<<<<<< HEAD
      this.initEmptyTextNode(content)
=======
      new TextNode(content, [])
>>>>>>> redux-support
    );

    return perspectiveId;
  }

<<<<<<< HEAD
  /** Creates a new context, perspective, and draft combo using this.initContext()
   * and adds it as a children of **an existing perspective** at a given index.
   *
=======
  /** Creates a new context, perspective, and draft combo using this.initContext() 
   * and adds it as a children of **an existing perspective** at a given index.
   * 
>>>>>>> redux-support
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
<<<<<<< HEAD
    content: string
  ): Promise<string> {
=======
    content: string): Promise<string> {
>>>>>>> redux-support
    const newPerspectiveId = await this.initContext(serviceProvider, content);
    await this.insertPerspective(
      serviceProvider,
      perspectiveId,
      newPerspectiveId,
      index
    );
    return newPerspectiveId;
  }

  /** Inserts an existing perspective (the child) as a child of another existing
   * perspective (the parent) on a given position.
   *
   * @param serviceProvider The service provider storing the draft of the parent
   * perspective. (The child perspective can come from another provider).
<<<<<<< HEAD
   *
   * @param onPerspectiveId The parent perspective id.
   *
   * @param perspectiveId The child perspective id.
   *
   * @param index The index in which the child perspective should be added.
   * `index = -1` can be used to add it as the last children.
   *
   *
   * @returns The id of the new child **perspective**.
   */
=======
   * 
   * @param onPerspectiveId The parent perspective id.
   * 
   * @param perspectiveId The child perspective id.
   * 
   * @param index The index in which the child perspective should be added. 
   * `index = -1` can be used to add it as the last children.
   * 
   * 
   * @returns The id of the new child **perspective**. 
  */
>>>>>>> redux-support
  async insertPerspective(
    serviceProvider: string,
    onPerspectiveId: string,
    perspectiveId: string,
<<<<<<< HEAD
    index: number
  ): Promise<void> {
    let draft = await this.getOrCreateDraft(serviceProvider, onPerspectiveId);

    if (index != -1) {
      if (0 < index && index < draft.links.length) {
        draft.links.splice(index, 0, { link: perspectiveId });
      } else if (index == draft.links.length) {
=======
    index: number): Promise<void> {
    let draft = await this.getOrCreateDraft(serviceProvider, onPerspectiveId);
    if (index != -1) {
      if ((0 < index) && (index < draft.links.length)) {
        draft.links.splice(index, 0, { link: perspectiveId });
      } else if (index == draft.links.length){
>>>>>>> redux-support
        /* accept length as index and interpret as push */
        draft.links.push({ link: perspectiveId });
      }
    } else {
      draft.links.push({ link: perspectiveId });
    }

    await this.data.setDraft(serviceProvider, onPerspectiveId, draft);

    return;
  }

  /** Remove one child perspective from its parent perspective.
<<<<<<< HEAD
   *
   * @param serviceProvider The service provider storing the draft of the parent
   * perspective.
   *
   * @param fromPerspectiveId The parent perspective id.
   *
   * @param perspectiveId The child perspective id to be removed (must be a current child
   * of the parent).
   *
   * @returns The id of the new child **perspective**.
   */
  async removePerspective(
    serviceProvider: string,
    fromPerspectiveId: string,
    perspectiveId: string
  ): Promise<void> {
    let draft = await this.data.getDraft(serviceProvider, fromPerspectiveId);

    let index = draft.links.findIndex(link => link.link === perspectiveId);
    if (index == -1)
      throw new Error(
        `perspective ${perspectiveId} not found under ${fromPerspectiveId}`
      );
=======
   * 
   * @param serviceProvider The service provider storing the draft of the parent 
   * perspective.
   * 
   * @param fromPerspectiveId The parent perspective id.
   * 
   * @param perspectiveId The child perspective id to be removed (must be a current child 
   * of the parent).
   *  
   * @returns The id of the new child **perspective**. 
  */
  async removePerspective(
    serviceProvider: string,
    fromPerspectiveId: string,
    perspectiveId: string): Promise<void> {

    let draft = await this.data.getDraft(serviceProvider, fromPerspectiveId);
    
    let index = draft.links.findIndex(link => link.link === perspectiveId);
    if (index == -1) throw new Error(`perspective ${perspectiveId} not found under ${fromPerspectiveId}`);
>>>>>>> redux-support

    /** remove the link */
    draft.links.splice(index, 1);

    /* udpate draft without the link */
    await this.data.setDraft(serviceProvider, fromPerspectiveId, draft);
  }

<<<<<<< HEAD
  /** Getter function to get or create a draft of/on a given perspective.
   *
   * @param serviceProvider The service provider from which the draft is to be retrieved.
   *
=======


  /** Getter function to get or create a draft of/on a given perspective.
   * 
   * @param serviceProvider The service provider from which the draft is to be retrieved.
   * 
>>>>>>> redux-support
   * @param perspectiveId The parent perspective id.
   *
   * @returns The draft object.
   */
  async getOrCreateDraft(
    serviceProvider: string,
<<<<<<< HEAD
    perspectiveId: string
  ): Promise<TextNode> {
=======
    perspectiveId: string,
    content: string = ''): Promise<ITextNode> {

>>>>>>> redux-support
    let draft = await this.data.getDraft(serviceProvider, perspectiveId);

    if (draft != null) {
      return draft;
    }

    await this.data.setDraft(
<<<<<<< HEAD
      serviceProvider,
      perspectiveId,
      this.initEmptyTextNode('')
    );
=======
      serviceProvider, perspectiveId, new TextNode(content, []));
>>>>>>> redux-support

    return this.data.getDraft(serviceProvider, perspectiveId);
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> redux-support
  async commitGlobal(
    draftServiceProvider: string,
    serviceProvider: string,
    perspectiveId: string,
    message: string,
<<<<<<< HEAD
    timestamp: number
  ) {
    timestamp = timestamp ? timestamp : Date.now();
    message = message ? message : '';

    const draft = await this.data.getDraft(
      draftServiceProvider,
      draftServiceProvider
    );
    const dataId = await this.data.createData(serviceProvider, draft);

    const headId = await this.uprtcl.getHead(perspectiveId);
    const parentsIds = headId ? [headId] : [];

    const commit: Commit = {
      creatorId: 'anon',
      dataId: dataId,
      message: message,
      parentsIds: parentsIds,
      timestamp: Date.now()
    };
    const commitId = await this.uprtcl.createCommit(serviceProvider, commit);
=======
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
>>>>>>> redux-support

    await this.uprtcl.updateHead(perspectiveId, commitId);
  }
}

export const uprtclData = new UprtclData();

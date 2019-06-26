import { DataService } from '../services/data.service';
import { UprtclService } from '../services/uprtcl.service';
import {
  sampleContext,
  samplePerspective,
  sampleCommit,
  Content,
  Node,
  History
} from './mocks/uprtcl.mock';
import { sampleData } from './mocks/data.mock';
import { Commit, TextNode } from '../types';

export class UptrclTestUtils {
  uprtcl: UprtclService;
  data: DataService;

  constructor(uprtcl: UprtclService, data: DataService) {
    this.uprtcl = uprtcl;
    this.data = data;
  }

  async initPerspective(
    sampleData: TextNode
  ): Promise<{
    contextId: string;
    perspectiveId: string;
    commitId: string;
    dataId: string;
  }> {
    const dataId = await this.data.createData(sampleData);
    const commitId = await this.uprtcl.createCommit(sampleCommit(dataId));
    const contextId = await this.uprtcl.createContext(sampleContext());
    const perspectiveId = await this.uprtcl.createPerspective(
      samplePerspective(contextId)
    );

    await this.uprtcl.updateHead(perspectiveId, commitId);

    return {
      dataId,
      commitId,
      perspectiveId,
      contextId
    };
  }

  /**
   * @returns the list of newly added perspective
   */
  async addNestedChildren(
    perspectiveId: string,
    texts: string[]
  ): Promise<string[]> {
    const promises = texts.map(text => this.initPerspective(sampleData(text)));
    const subs = await Promise.all(promises);

    const root = await this.getPerspectiveContent(perspectiveId);

    if (!root.data) {
      root.data = sampleData('');
    }
    root.data.links.concat(subs.map(sub => ({ link: sub.perspectiveId })));

    await this.commitData(perspectiveId, root.data);

    return subs.map(sub => sub.perspectiveId);
  }

  async commitData(perspectiveId: string, data: TextNode) {
    const dataId = await this.data.createData(data);
    const commitId = await this.uprtcl.createCommit(sampleCommit(dataId));
    await this.uprtcl.updateHead(perspectiveId, commitId);
  }

  async getPerspectiveContent(perspectiveId: string): Promise<Content> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const context = await this.uprtcl.getContext(perspective.contextId);
    const headId = await this.uprtcl.getHead(perspectiveId);
    let commit: Commit = null;
    let data: TextNode = null;
    if (headId) {
      commit = await this.uprtcl.getCommit(headId);
      data = await this.data.getData(commit.dataId);
    }

    return { perspective, context, commit, data };
  }

  async recursePerspectiveTree<A>(
    perspectiveId: string,
    action: (
      content: Content,
      childrenResult: Array<A>,
      node: string
    ) => Promise<A>,
    node: Node = null
  ): Promise<A> {
    const content = await this.getPerspectiveContent(perspectiveId);
    const promises = content.data.links.map((link, index) =>
      this.recursePerspectiveTree(
        link.link,
        action,
        node ? node[1][index] : null
      )
    );
    const result = await Promise.all(promises);

    return action(content, result, node ? node[0] : null);
  }

  async createCommitIn(
    perspectiveId: string,
    data: string | TextNode
  ): Promise<string> {
    const parentCommitId = await this.uprtcl.getHead(perspectiveId);

    if (typeof data === 'string') {
      const commit = await this.uprtcl.getCommit(parentCommitId);
      const oldData = await this.data.getData(commit.dataId);
      data = { ...oldData, text: data };
    }

    const dataId = await this.data.createData(data);
    const newCommitId = await this.uprtcl.createCommit(
      sampleCommit(dataId, [parentCommitId])
    );

    await this.uprtcl.updateHead(perspectiveId, newCommitId);

    return newCommitId;
  }

  createGlobalPerspective(
    perspectiveId: string,
    node: string | Node
  ): Promise<string> {
    let globalText = null;
    if (typeof node === 'string') {
      globalText = node;
      node = null;
    }

    return this.recursePerspectiveTree(
      perspectiveId,
      async (content, childrenPerspectivesId: string[], text: string) => {
        if (text || globalText) {
          content.data.text = text ? text : globalText;
        }
        content.data.links = childrenPerspectivesId.map(id => ({ link: id }));

        const dataId = await this.data.createData(content.data);
        const commitId = await this.uprtcl.createCommit(
          sampleCommit(dataId, [content.commit.id])
        );
        const newPerspectiveId = await this.uprtcl.createPerspective(
          samplePerspective(content.context.id)
        );

        await this.uprtcl.updateHead(newPerspectiveId, commitId);

        return newPerspectiveId;
      },
      <Node>node
    );
  }

  async createGlobalCommit(
    perspectiveId: string,
    node: string | Node
  ): Promise<string> {
    let globalText = null;
    if (typeof node === 'string') {
      globalText = node;
      node = null;
    }
    return await this.recursePerspectiveTree(
      perspectiveId,
      async (content, _result, text) => {
        content.data.text = text ? text : globalText;
        return this.createCommitIn(content.perspective.id, content.data);
      },
      <Node>node
    );
  }

  async buildNode(node: Node): Promise<string> {
    const promises = node[1].map(n => this.buildNode(n));
    const perspectiveIds = await Promise.all(promises);

    const pers = await this.initPerspective(
      sampleData(node[0], '', perspectiveIds.map(id => ({ link: id })))
    );

    return pers.perspectiveId;
  }

  async getNode(perspectiveId): Promise<Node> {
    const content = await this.getPerspectiveContent(perspectiveId);
    const promises = content.data.links.map(link => this.getNode(link.link));
    const nodes = await Promise.all(promises);

    return [content.data.text, nodes];
  }

  async getPerspectivesNode(perspectiveId): Promise<Node> {
    const content = await this.getPerspectiveContent(perspectiveId);
    const promises = content.data.links.map(link =>
      this.getPerspectivesNode(link.link)
    );
    const nodes = await Promise.all(promises);

    return [perspectiveId, nodes];
  }

  async getCommitHistory(commitId: string): Promise<History> {
    const commit = await this.uprtcl.getCommit(commitId);
    const promises = commit.parentsIds.map(id => this.getCommitHistory(id));
    const histories = await Promise.all(promises);

    return [commit, histories];
  }

  async getHistory(perspectiveId: string): Promise<History> {
    const headId = await this.uprtcl.getHead(perspectiveId);
    return this.getCommitHistory(headId);
  }

  async buryPerspective(
    rootPerspectiveId: string,
    perspectiveId: string,
    nodeText: string
  ): Promise<void> {
    return this.recursePerspectiveTree(rootPerspectiveId, async content => {
      const index = content.data.links.findIndex(
        link => link.link === perspectiveId
      );
      if (index !== -1) {
        const result = await this.initPerspective(
          sampleData(nodeText, '', [{ link: perspectiveId }])
        );
        content.data.links[index].link = result.perspectiveId;
        await this.createCommitIn(content.perspective.id, content.data);
      }
    });
  }
}

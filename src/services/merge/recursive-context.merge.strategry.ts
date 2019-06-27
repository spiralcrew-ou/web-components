import { Perspective, TextNode, Commit } from '../../types';
import { SimpleMergeStrategy } from './simple.merge.strategy';

type Dictionary<T> = { [key: string]: T };

export class RecursiveContextMergeStrategy extends SimpleMergeStrategy {
  perspectivesByContext: Dictionary<{
    to: string;
    from: string[];
  }>;

  allPerspectives: Dictionary<Perspective>;

  setPerspective(perspective: Perspective, to: boolean): void {
    if (!this.perspectivesByContext[perspective.contextId]) {
      this.perspectivesByContext[perspective.contextId] = {
        to: null,
        from: []
      };
    }

    if (to) {
      this.perspectivesByContext[perspective.contextId].to = perspective.id;
    } else {
      this.perspectivesByContext[perspective.contextId].from.push(
        perspective.id
      );
    }

    this.allPerspectives[perspective.id] = perspective;
  }

  async readPerspective(perspectiveId: string, to: boolean): Promise<void> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    this.setPerspective(perspective, to);

    const headId = await this.uprtcl.getHead(perspectiveId);
    const head = await this.uprtcl.getCommit(headId);
    const data = await this.data.getData(head.dataId);

    const promises = data.links.map(link =>
      this.readPerspective(link.link, to)
    );
    await Promise.all(promises);
  }

  async readAllSubcontexts(
    toPerspectiveId: string,
    fromPerspectivesIds: string[]
  ): Promise<void> {
    const promises = fromPerspectivesIds.map(perspectiveId =>
      this.readPerspective(perspectiveId, false)
    );
    promises.push(this.readPerspective(toPerspectiveId, true));

    await Promise.all(promises);
  }

  async mergePerspectives(
    toPerspectiveId: string,
    fromPerspectivesIds: string[]
  ): Promise<string> {
    let root = false;
    if (!this.perspectivesByContext) {
      root = true;
      this.perspectivesByContext = {};
      this.allPerspectives = {};
      await this.readAllSubcontexts(toPerspectiveId, fromPerspectivesIds);
    }

    const headId = await super.mergePerspectives(
      toPerspectiveId,
      fromPerspectivesIds
    );

    if (root) {
      this.perspectivesByContext = null;
      this.allPerspectives = null;
    }
    return headId;
  }

  async mergeLinks(
    originalLinks: string[],
    modificationsLinks: string[][]
  ): Promise<string[]> {
    const pIdToCid = (perspectiveId: string) =>
      this.allPerspectives[perspectiveId].contextId;

    const originalContexts = originalLinks.map(pIdToCid);
    const modificationsContexts = modificationsLinks.map(links =>
      links.map(pIdToCid)
    );

    const contextIdLinks = await super.mergeLinks(
      originalContexts,
      modificationsContexts
    );

    const dictionary = this.perspectivesByContext;

    const promises = contextIdLinks.map(async contextId => {
      const perspectivesByContext = dictionary[contextId];

      const needsSubperspectiveMerge =
        perspectivesByContext &&
        perspectivesByContext.to &&
        perspectivesByContext.from &&
        perspectivesByContext.from.length > 0;

      if (needsSubperspectiveMerge) {
        // We need to merge the new perspectives with the original perspective
        await this.mergePerspectives(
          perspectivesByContext.to,
          perspectivesByContext.from
        );

        // The final perspective has not changed
        return perspectivesByContext.to;
      } else {
        const finalPerspectiveId = perspectivesByContext.to
          ? perspectivesByContext.to
          : perspectivesByContext.from[0];

        await this.mergePerspectiveChildren(finalPerspectiveId);

        return finalPerspectiveId;
      }
    });

    const links = await Promise.all(promises);

    return links;
  }

  protected async getPerspectiveData(perspectiveId: string): Promise<TextNode> {
    let headId = await this.uprtcl.getHead(perspectiveId);
    const commit = await this.uprtcl.getCommit(headId);
    return this.data.getData(commit.dataId);
  }

  protected async updatePerspectiveData(
    perspectiveId,
    node: TextNode
  ): Promise<void> {
    let headId = await this.uprtcl.getHead(perspectiveId);
    const newDataId = await this.data.createData(node);
    const commit: Commit = {
      creatorId: 'anon',
      dataId: newDataId,
      parentsIds: [headId],
      message: 'Update perspective by merge',
      timestamp: Date.now()
    };
    headId = await this.uprtcl.createCommit(commit);
    await this.uprtcl.updateHead(perspectiveId, headId);
  }

  private async mergePerspectiveChildren(perspectiveId: string): Promise<void> {
    const data = await this.getPerspectiveData(perspectiveId);

    const rawLinks = data.links.map(link => link.link);

    const mergedLinks = await this.mergeLinks(rawLinks, [rawLinks]);

    if (!rawLinks.every((link, index) => link !== mergedLinks[index])) {
      const node: TextNode = {
        ...data,
        links: mergedLinks.map(link => ({ link }))
      };

      await this.updatePerspectiveData(perspectiveId, node);
    }
  }
}

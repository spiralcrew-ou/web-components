import { Perspective } from '../../types';
import { UprtclMultiplatform } from '../multiplatform/uprtcl.multiplatform';
import { SimpleMergeStrategy } from './simple.merge.strategy';

type Dictionary<T> = { [key: string]: T };

export class RecursiveContextMergeStrategy extends SimpleMergeStrategy {
  contextPerspectives: Dictionary<{
    to: string;
    from: string[];
  }>;

  setPerspective(perspective: Perspective, to: boolean): void {
    if (!this.contextPerspectives[perspective.contextId]) {
      this.contextPerspectives[perspective.contextId] = {
        to: null,
        from: []
      };
    }

    if (to) {
      this.contextPerspectives[perspective.contextId].to = perspective.id;
    } else {
      this.contextPerspectives[perspective.contextId].from.push(perspective.id);
    }
  }

  async readPerspective(perspectiveId: string, to: boolean): Promise<void> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    this.setPerspective(perspective, to);

    const headId = await (<UprtclMultiplatform>this.uprtcl).getHead(
      perspectiveId
    );
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
    if (!this.contextPerspectives) {
      root = true;
      this.contextPerspectives = {};
      await this.readAllSubcontexts(toPerspectiveId, fromPerspectivesIds);
    }

    const headId = await super.mergePerspectives(
      toPerspectiveId,
      fromPerspectivesIds
    );

    if (root) {
      this.contextPerspectives = null;
    }
    return headId;
  }

  async mergeLinks(
    originalLinks: string[],
    modificationsLinks: string[][]
  ): Promise<string[]> {
    const links = await super.mergeLinks(originalLinks, modificationsLinks);

    const promises = links.map(link => this.uprtcl.getPerspective(link));
    const perspectives = await Promise.all(promises);

    const dictionary = this.contextPerspectives;

    for (let i = 0; i < links.length; i++) {
      const contextPerspectives = dictionary[perspectives[i].contextId];

      // HERE THE BUG
      const needsSubperspectiveMerge =
        contextPerspectives &&
        contextPerspectives.to &&
        contextPerspectives.from &&
        contextPerspectives.from.length > 0;

      if (needsSubperspectiveMerge) {
        // We need to merge the new perspectives with the original perspective
        await this.mergePerspectives(
          contextPerspectives.to,
          contextPerspectives.from
        );

        // The final perspective has not changed
        links[i] = contextPerspectives.to;
      }
    }

    return links;
  }
}

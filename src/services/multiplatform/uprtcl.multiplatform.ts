import { UprtclService } from '../uprtcl.service';
import { Context, Perspective, Commit, Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { UprtclLocal } from '../local/uprtcl.local';

export class UprtclMultiplatform extends CachedMultiplatform<UprtclService> {
  linksFromPerspective(perspective: Perspective) {
    return [perspective.contextId];
  }

  linksFromCommit(commit: Commit) {
    return [commit.dataId, ...commit.parentsIds];
  }

  constructor(
    serviceProviders: Dictionary<{
      service: UprtclService;
      discovery: DiscoveryService;
    }>
  ) {
    super(serviceProviders, new UprtclLocal());
  }

  async getContext(contextId: string): Promise<Context> {
    return await this.cachedDiscover(
      contextId,
      service => service.getContext(contextId),
      (service, context) => service.createContext(context)
    );
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    return await this.cachedDiscover(
      perspectiveId,
      service => service.getPerspective(perspectiveId),
      (service, perspective) => service.createPerspective(perspective),
      this.linksFromPerspective
    );
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await this.cachedDiscover(
      commitId,
      service => service.getCommit(commitId),
      (service, commit) => service.createCommit(commit),
      this.linksFromCommit
    );
  }

  async getRootContextId(serviceProvider: string): Promise<string> {
    return this.getServiceProvider(serviceProvider).getRootContextId();
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    const perspectives = await this.getFromAllSources(
      contextId,
      service => service.getContextPerspectives(contextId),
      (perspectives: Perspective[]) =>
        perspectives.reduce(
          (links, p) => [...links, ...this.linksFromPerspective(p)],
          []
        )
    );

    // Flatten the perspective array
    return perspectives.reduce((a, e) => a.concat(...e), []);
  }

  createContext(serviceProvider: string, context: Context): Promise<string> {
    return this.optimisticCreate(
      serviceProvider,
      context,
      (service, context) => service.createContext(context),
      []
    );
  }

  async createPerspective(
    serviceProvider: string,
    perspective: Perspective
  ): Promise<string> {
    return this.optimisticCreate(
      serviceProvider,
      perspective,
      (service, perspective) => service.createPerspective(perspective),
      this.linksFromPerspective(perspective)
    );
  }

  createCommit(serviceProvider: string, commit: Commit): Promise<string> {
    return this.optimisticCreate(
      serviceProvider,
      commit,
      (service, commit) => service.createCommit(commit),
      this.linksFromCommit(commit)
    );
  }

  async getHead(perspectiveId: string): Promise<string> {
    const perspective = await this.getPerspective(perspectiveId);

    if (perspective == null) {
      return null;
    }

    const origin = perspective.origin;
    return this.fallbackGet(
      origin,
      service => service.getHead(perspectiveId),
      headId => [headId]
    );
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    const perspective = await this.getPerspective(perspectiveId);
    const origin = perspective.origin;

    return this.optimisticUpdate(
      origin,
      service => service.updateHead(perspectiveId, headId),
      [headId]
    );
  }
}

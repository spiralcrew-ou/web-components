import { UprtclService } from '../uprtcl.service';
import { Context, Perspective, Commit, Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { UprtclLocal } from '../local/uprtcl.local';
import { CidConfig } from '../local/cid.config';

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
    }>, cidConfig: CidConfig
  ) {
    super(serviceProviders, new UprtclLocal(cidConfig));
  }

  async getContext(contextId: string): Promise<Context> {
    return await this.cachedDiscover(
      contextId,
      service => service.getContext(contextId),
      (service, context) => service.createContext(context),
      () => []
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
    try {
      const rootContextId = await this.getServiceProvider(serviceProvider).getRootContextId();
      await (<UprtclLocal>this.cacheService).setProviderRootContextId(serviceProvider, rootContextId);
      return rootContextId;
    } catch(e) {
      return (<UprtclLocal>this.cacheService).getProviderRootContextId(serviceProvider);
    }
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    const getter = service => service.getContextPerspectives(contextId);

    const sourcesGetter = () =>
      this.getFromAllSources(
        contextId,
        getter,
        (perspectives: Perspective[]) => {
          const flat = Array.prototype.concat.apply([], perspectives);
          return flat.map(p => this.linksFromPerspective(p));
        }
      ).then(perspectives => Array.prototype.concat.apply([], perspectives));

    const clonePerspectives = (service, perspectives: Perspective[]) =>
      Promise.all(perspectives.map(p => service.createPerspective(p)));

    return this.fallback(sourcesGetter, clonePerspectives, service =>
      service.getContextPerspectives(contextId)
    );
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
    console.log('createPerspective');
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
    return this.fallback(
      () =>
        this.getFromSource(
          origin,
          s => s.getHead(perspectiveId),
          headId => [headId]
        ),
      (service, headId) => service.updateHead(perspectiveId, headId),
      service => service.getHead(perspectiveId)
    );
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    const perspective = await this.getPerspective(perspectiveId);
    const origin = perspective.origin;

    return this.optimisticUpdate(
      origin,
      service => service.updateHead(perspectiveId, headId),
      [headId],
      `Update head of ${perspectiveId}`
    );
  }
}

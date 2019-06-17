import { UprtclService } from '../uprtcl.service';
import { Context, Perspective, Commit, Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { UprtclLocal } from '../local/uprtcl.local';

export class UprtclMultiplatform extends CachedMultiplatform<UprtclService> {
  linksFromPerspective(perspective: Perspective) {
    return [perspective.contextId, perspective.headId];
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
    return await this.cachedDiscoverObject(
      contextId,
      service => service.getContext(contextId),
      (service, context) => service.cloneContext(context)
    );
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    return await this.discoverObject(
      perspectiveId,
      service => service.getPerspective(perspectiveId),
      this.linksFromPerspective
    );
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await this.cachedDiscoverObject(
      commitId,
      service => service.getCommit(commitId),
      (service, commit) => service.cloneCommit(commit),
      this.linksFromCommit
    );
  }

  async getRootContextId(serviceProvider: string): Promise<string> {
    const provider = this.getServiceProvider(serviceProvider);
    let rootContextId = await provider.getRootContextId();
    const rootContext = await provider.getContext(rootContextId);

    const defaultDiscovery = this.serviceProviders[serviceProvider].discovery;
    let defaultSource = serviceProvider;
    if (defaultDiscovery) {
      defaultSource = await defaultDiscovery.getOwnSource();
    }

    if (!rootContext) {
      rootContextId = await this.createContext(serviceProvider, 0, 0);
      // Create an empty perspective
      const perspectiveId = await this.createPerspective(
        serviceProvider,
        rootContextId,
        'User Context',
        new Date().getTime(),
        null
      );
      await this.knownSources.addKnownSources(perspectiveId, [defaultSource]);
    }
    await this.knownSources.addKnownSources(rootContextId, [defaultSource]);
    return rootContextId;
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

  createContext(
    serviceProvider: string,
    timestamp: number,
    nonce: number
  ): Promise<string> {
    return this.cachedCreateWithLinks(
      serviceProvider,
      (service, hash) => service.getContext(hash),
      service => service.createContext(timestamp, nonce),
      (service, context) => service.cloneContext(context),
      []
    );
  }

  async createPerspective(
    serviceProvider: string,
    contextId: string,
    name: string,
    timestamp: number,
    headId: string
  ): Promise<string> {
    (<UprtclLocal>this.cacheService).setCurrentOrigin(serviceProvider);

    const links = [contextId];
    if (headId) {
      links.push(headId);
    }
    return this.cachedCreateWithLinks(
      serviceProvider,
      (service, hash) => service.getPerspective(hash),
      service => service.createPerspective(contextId, name, timestamp, headId),
      (service, perspective) => service.clonePerspective(perspective),
      links
    );
  }

  createCommit(
    serviceProvider: string,
    timestamp: number,
    message: string,
    parentsIds: string[],
    dataId: string
  ): Promise<string> {
    debugger
    return this.cachedCreateWithLinks(
      serviceProvider,
      (service, hash) => service.getCommit(hash),
      service => service.createCommit(timestamp, message, parentsIds, dataId),
      (service, commit) => service.cloneCommit(commit),
      [...parentsIds, dataId]
    );
  }

  cloneContext(serviceProvider: string, context: Context): Promise<string> {
    return this.getServiceProvider(serviceProvider).cloneContext(context);
  }

  clonePerspective(
    serviceProvider: string,
    perspective: Perspective
  ): Promise<string> {
    return this.getServiceProvider(serviceProvider).clonePerspective(
      perspective
    );
  }

  cloneCommit(serviceProvider: string, commit: Commit): Promise<string> {
    return this.getServiceProvider(serviceProvider).cloneCommit(commit);
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    const sources = await this.knownSources.getKnownSources(perspectiveId);
    if (sources.length !== 1) {
      throw new Error('Perspective has more than one known source');
    }

    return this.cachedUpdateWithLinks(sources[0], service => service.updateHead(perspectiveId, headId), [headId]);
  }
}

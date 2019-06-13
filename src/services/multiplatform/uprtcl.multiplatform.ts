import { UprtclService } from '../uprtcl.service';
import { Context, Perspective, Commit, Dictionary } from '../../types';
import { Multiplatform } from './multiplatform';
import { DiscoveryService } from '../discovery.service';

export class UprtclMultiplatform extends Multiplatform<UprtclService> {
  linksFromPerspective(perspective: Perspective) {
    return [ perspective.contextId, perspective.headId ]
  };

  linksFromCommit(commit: Commit) {
    return [ commit.dataId, ...commit.parentsIds ]
  };

  constructor(
    serviceProviders: Dictionary<{
      service: UprtclService;
      discovery: DiscoveryService;
    }>
  ) {
    super(serviceProviders);
  }

  async getContext(contextId: string): Promise<Context> {
    return await this.discoverObject(contextId, (service, hash) =>
      service.getContext(hash)
    );
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    return await this.discoverObject(
      perspectiveId,
      (service, hash) => service.getPerspective(hash),
      perspective => [perspective.headId, perspective.contextId]
    );
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await this.discoverObject(
      commitId,
      (service, hash) => service.getCommit(hash),
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
      (service, hash) => service.getContextPerspectives(hash),
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
    return this.createWithLinks(
      serviceProvider,
      service => service.createContext(timestamp, nonce),
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
    const links = [contextId];
    if (headId) {
      links.push(headId);
    }
    return this.createWithLinks(
      serviceProvider,
      service => service.createPerspective(contextId, name, timestamp, headId),
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
    return this.createWithLinks(
      serviceProvider,
      service => service.createCommit(timestamp, message, parentsIds, dataId),
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
    return this.serviceProviders[sources[0]].service.updateHead(
      perspectiveId,
      headId
    );
  }
}

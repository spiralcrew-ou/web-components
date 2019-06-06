import { UprtclService } from '../uprtcl.service';
import { Context, Perspective, Commit, Dictionary } from '../../types';
import { Multiplatform } from './multiplatform';
import { DiscoveryService } from '../discovery.service';

export class UprtclMultiplatform extends Multiplatform<UprtclService>
  implements UprtclService {
  defaultServiceProvider: string;

  constructor(
    serviceProviders: Dictionary<{
      service: UprtclService;
      discovery: DiscoveryService;
    }>,
    defaultServiceProvider: string
  ) {
    super(serviceProviders);
    this.defaultServiceProvider = defaultServiceProvider;
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
      perspective => (perspective.headId ? [perspective.headId] : [])
    );
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await this.discoverObject(
      commitId,
      (service, hash) => service.getCommit(hash),
      commit => [commit.dataId, ...commit.parentsIds]
    );
  }

  async getRootContextId(): Promise<string> {
    let rootContextId = await this.getDefaultServiceProvider().getRootContextId();
    const rootContext = await this.getDefaultServiceProvider().getContext(
      rootContextId
    );

    const defaultDiscovery = this.serviceProviders[this.defaultServiceProvider]
      .discovery;
    let defaultSource = this.defaultServiceProvider;
    if (defaultDiscovery) {
      defaultSource = await defaultDiscovery.getOwnSource();
    }

    if (!rootContext) {
      rootContextId = await this.createContext(0, 0);
      // Create an empty perspective
      const perspectiveId = await this.createPerspective(
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

  getContextId(context: Context): Promise<string> {
    return this.getDefaultServiceProvider().getContextId(context);
  }

  getContextPerspectives(contextId: string): Promise<Perspective[]> {
    return this.discoverArray(
      contextId,
      (service, hash) => service.getContextPerspectives(hash),
      perspective => (perspective.headId ? [perspective.headId] : [])
    );
  }

  createContext(timestamp: number, nonce: number): Promise<string> {
    return this.createWithLinks(
      this.defaultServiceProvider,
      service => service.createContext(timestamp, nonce),
      []
    );
  }

  createPerspective(
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
      this.defaultServiceProvider,
      service => service.createPerspective(contextId, name, timestamp, headId),
      links
    );
  }

  createCommit(
    timestamp: number,
    message: string,
    parentsIds: string[],
    dataId: string
  ): Promise<string> {
    return this.createWithLinks(
      this.defaultServiceProvider,
      service => service.createCommit(timestamp, message, parentsIds, dataId),
      [...parentsIds, dataId]
    );
  }

  cloneContext(context: Context): Promise<string> {
    return this.getDefaultServiceProvider().cloneContext(context);
  }

  clonePerspective(perspective: Perspective): Promise<string> {
    return this.getDefaultServiceProvider().clonePerspective(perspective);
  }

  cloneCommit(commit: Commit): Promise<string> {
    return this.getDefaultServiceProvider().cloneCommit(commit);
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

  /** Service Providers */

  getDefaultServiceProvider(): UprtclService {
    return this.serviceProviders[this.defaultServiceProvider].service;
  }
}

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
    return await this.discover(contextId, (service, hash) =>
      service.getContext(hash)
    );
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    return await this.discover(
      perspectiveId,
      (service, hash) => service.getPerspective(hash),
      perspective => [perspective.headId]
    );
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await this.discover(
      commitId,
      (service, hash) => service.getCommit(hash),
      commit => [commit.dataId, ...commit.parentsIds ]
    );
  }

  getRootContextId(): Promise<string> {
    return this.getDefaultServiceProvider().getRootContextId();
  }

  getContextId(context: Context): Promise<string> {
    return this.getDefaultServiceProvider().getContextId(context);
  }

  getContextPerspectives(contextId: string): Promise<Perspective[]> {
    return this.getDefaultServiceProvider().getContextPerspectives(contextId);
  }

  createContext(timestamp: number, nonce: number): Promise<string> {
    return this.getDefaultServiceProvider().createContext(timestamp, nonce);
  }

  createPerspective(
    contextId: string,
    name: string,
    timestamp: number,
    headId: string
  ): Promise<string> {
    return this.getDefaultServiceProvider().createPerspective(
      contextId,
      name,
      timestamp,
      headId
    );
  }

  createCommit(
    timestamp: number,
    message: string,
    parentsIds: string[],
    dataId: string
  ): Promise<string> {
    return this.getDefaultServiceProvider().createCommit(
      timestamp,
      message,
      parentsIds,
      dataId
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

  getDefaultServiceProvider() {
    return this.serviceProviders[this.defaultServiceProvider].service;
  }
}

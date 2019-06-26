import { UprtclService } from '../uprtcl.service';
import {
  Context,
  Perspective,
  Commit,
  Dictionary,
  PropertyOrder
} from '../../types';
import { DiscoveryService } from '../discovery.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { UprtclLocal } from '../local/uprtcl.local';
import { ipldService } from '../ipld';
import { CidConfig } from '../cid.config';

const currentAuthorId = 'guille:13';

export class UprtclMultiplatform extends CachedMultiplatform<UprtclService>
  implements UprtclService {
  linksFromPerspective(perspective: Perspective) {
    return [perspective.contextId];
  }

  linksFromCommit(commit: Commit) {
    return [commit.dataId, ...commit.parentsIds];
  }

  defaultService: string;

  constructor(
    serviceProviders: Dictionary<{
      service: UprtclService;
      discovery: DiscoveryService;
    }>,
    defaultService: string
  ) {
    super(serviceProviders, new UprtclLocal());
    this.defaultService = defaultService;
  }

  /** The multiplatform service is the one who knows the current author DID */
  async getRootContextId(serviceProvider: string): Promise<string> {
    let userContext: Context = {
      creatorId: currentAuthorId,
      timestamp: 0,
      nonce: 0
    };

    const cidConfig = this.getServiceProvider(serviceProvider).getCidConfig();

    let rootContextId = await ipldService.generateCidOrdered(
      userContext,
      cidConfig,
      PropertyOrder.Context
    );

    /** Force the root context object to exist in the service provider */
    let rootContextId1 = await this.createContextIn(
      serviceProvider,
      userContext
    );

    if (rootContextId !== rootContextId1) {
      throw new Error(
        `Unexpected condition on service provider. 
        The computeContextId ${rootContextId} is different 
        from ${rootContextId1} id of the generated context`
      );
    }

    return rootContextId;
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

  async getCachedContextsPerspectives(
    contextId: string
  ): Promise<Perspective[]> {
    const perspectives = await this.cacheService.getContextPerspectives(
      contextId
    );
    if (perspectives) {
      return perspectives;
    } else {
      return this.getContextPerspectives(contextId);
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

    const clonePerspectives = (
      service: UprtclService,
      perspectives: Perspective[]
    ) => Promise.all(perspectives.map(p => service.createPerspective(p)));

    return this.fallback(sourcesGetter, clonePerspectives, service =>
      service.getContextPerspectives(contextId)
    );
  }

  createContext(context: Context): Promise<string> {
    return this.createContextIn(this.defaultService, context);
  }

  createContextIn(serviceProvider: string, context: Context): Promise<string> {
    (<UprtclLocal>this.cacheService).setCidConfig(
      this.getServiceProvider(serviceProvider).getCidConfig()
    );
    return this.optimisticCreate(
      serviceProvider,
      context,
      (service, context) => service.createContext(context),
      []
    );
  }

  async createPerspective(perspective: Perspective): Promise<string> {
    return this.createPerspectiveIn(this.defaultService, perspective);
  }

  async createPerspectiveIn(
    serviceProvider: string,
    perspective: Perspective
  ): Promise<string> {
    (<UprtclLocal>this.cacheService).setCidConfig(
      this.getServiceProvider(serviceProvider).getCidConfig()
    );

    const initHead = async (perspectiveId: string) => {
      const isHeadCached = await (<UprtclLocal>this.cacheService).headExists(
        perspectiveId
      );

      if (!isHeadCached) {
        await this.cacheService.updateHead(perspectiveId, null);
      }
    };

    return this.optimisticCreate(
      serviceProvider,
      perspective,
      async (service, perspective) => {
        const perspectiveId = await service.createPerspective(perspective);
        await initHead(perspectiveId);
        return perspectiveId;
      },
      this.linksFromPerspective(perspective)
    );
  }

  createCommit(commit: Commit): Promise<string> {
    return this.createCommitIn(this.defaultService, commit);
  }

  createCommitIn(serviceProvider: string, commit: Commit): Promise<string> {
    (<UprtclLocal>this.cacheService).setCidConfig(
      this.getServiceProvider(serviceProvider).getCidConfig()
    );
    return this.optimisticCreate(
      serviceProvider,
      commit,
      (service, commit) => service.createCommit(commit),
      this.linksFromCommit(commit)
    );
  }

  async getCachedHead(perspectiveId: string): Promise<string> {
    const isHeadCached = await (<UprtclLocal>this.cacheService).headExists(
      perspectiveId
    );
    if (isHeadCached) {
      return this.cacheService.getHead(perspectiveId);
    } else {
      return this.getHead(perspectiveId);
    }
  }

  async getHead(perspectiveId: string): Promise<string> {
    const perspective = await this.getPerspective(perspectiveId);

    if (perspective == null) {
      return null;
    }

    /** head is the special guy. It is always retreived from
     * the perspective origin to prevent attacks. */
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
      `Update head of ${perspectiveId}`,
      perspectiveId
    );
  }

  getCidConfig(): CidConfig {
    throw new Error('Method not implemented.');
  }
}

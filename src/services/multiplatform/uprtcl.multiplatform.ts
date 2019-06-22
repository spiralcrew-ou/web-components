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

const currentAuthorId = 'anonymous:101';

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
    let rootContextId1 = await this.createContext(serviceProvider, userContext);

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
    let clonner = (service, objectAndCidConfig):Promise<any> => {
      service.setCidConfig(objectAndCidConfig.cidConfig);
      return service.createContext(objectAndCidConfig.object);
    }
    return await this.cachedDiscover(
      contextId,
      service => service.getContext(contextId),
      clonner,
      () => []
    );
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    let clonner = (service, objectAndCidConfig):Promise<any> => {
      service.setCidConfig(objectAndCidConfig.cidConfig);
      return service.createPerspective(objectAndCidConfig.object);
    }

    return await this.cachedDiscover(
      perspectiveId,
      service => service.getPerspective(perspectiveId),
      clonner,
      this.linksFromPerspective
    );
  }

  async getCommit(commitId: string): Promise<Commit> {
    let clonner = (service, objectAndCidConfig):Promise<any> => {
      service.setCidConfig(objectAndCidConfig.cidConfig);
      return service.createCommit(objectAndCidConfig.object);
    }

    return await this.cachedDiscover(
      commitId,
      service => service.getCommit(commitId),
      clonner,
      this.linksFromCommit
    );
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    
    let perspectiveAndCidConfigsGroups = await this.getFromAllSources(
        contextId,
        service => service.getContextPerspectives(contextId),
        (perspectives: Perspective[]) => {
          const flat = Array.prototype.concat.apply([], perspectives);
          return flat.map(p => this.linksFromPerspective(p));
        }
      );

    let perspectivesGroups = perspectiveAndCidConfigsGroups.map(pAndCidC => pAndCidC.object);

    let perspectives = 
      Array.prototype.concat.apply([], perspectivesGroups);

    Promise.all(perspectives.map(perspective => {
      /** @Guillem to be reviewed, why is the 0 index here?*/
      this.cacheService.setCidConfig(perspectiveAndCidConfigsGroups[0].cidConfig);
      this.cacheService.createPerspective(perspective);
    }));

    return perspectives;
  }

  createContext(serviceProvider: string, context: Context): Promise<string> {
    this.cacheService.setCidConfig(
      this.serviceProviders[serviceProvider].service.getCidConfig()
    );
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
    this.cacheService.setCidConfig(
      this.serviceProviders[serviceProvider].service.getCidConfig()
    );
    return this.optimisticCreate(
      serviceProvider,
      perspective,
      (service, perspective) => service.createPerspective(perspective),
      this.linksFromPerspective(perspective)
    );
  }

  createCommit(serviceProvider: string, commit: Commit): Promise<string> {
    this.cacheService.setCidConfig(
      this.serviceProviders[serviceProvider].service.getCidConfig()
    );
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

    /** head is the special guy. It is always retreived from 
     * the perspective origin to prevent attacks. */
    const origin = perspective.origin;
    
    let objectAndCidConfig = await this.getFromSource(
      origin, 
      s => s.getHead(perspectiveId),
      headId => [headId])

    if (objectAndCidConfig.object) {
      await this.updateHead(perspectiveId, objectAndCidConfig.object);
    }

    return objectAndCidConfig.object;
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

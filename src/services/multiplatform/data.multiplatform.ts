import { DiscoveryProvider } from './multiplatform';
import { DataService } from '../data.service';
import { TextNode, Dictionary } from '../../types';
import { DraftService } from '../draft.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { DataLocal } from '../local/data.local';
import { DraftLocal } from '../local/draft.local';
import { CidCompatible } from '../cid.service';
import { CidConfig } from '../cid.config';

export interface DataProvider<T> extends CidCompatible {
  data: DataService<T>;
  draft: DraftService;
  getCidConfig(): CidConfig;
  setCidConfig(config: CidConfig);
}

export class DataMultiplatform extends CachedMultiplatform<DataProvider<any>> {
  linksFromTextNode = node => node.links.map(link => link.link);

  constructor(serviceProviders: Dictionary<DiscoveryProvider<DataProvider<any>>>) {
    super(serviceProviders, { 
      data: new DataLocal(), 
      draft: new DraftLocal<TextNode>(),
      setCidConfig: () => {},
      getCidConfig: ():CidConfig => {return null}
    });
  }

  getData<T>(dataId: string): Promise<T> {
    let clonner = (service, objectAndCidConfig):Promise<any> => {
      service.data.setCidConfig(objectAndCidConfig.cidConfig);
      return service.data.createData(objectAndCidConfig.object);
    }
    return this.cachedDiscover(
      dataId,
      service => service.data.getData(dataId),
      clonner,
      this.linksFromTextNode
    );
  }

  createData<T>(serviceProvider: string, data: T): Promise<string> {
    this.cacheService.data.setCidConfig(
      this.serviceProviders[serviceProvider].service.data.getCidConfig()
    );
    return this.optimisticCreate(
      serviceProvider,
      data,
      (service, object) => service.data.createData(object),
      this.linksFromTextNode(data)
    );
  }

  async getDraft<T>(serviceProvider: string, objectId: string): Promise<T> {
    
    const objectAndCidConfig = await this.getFromSource(
        serviceProvider,
        service => service.draft.getDraft(objectId),
        this.linksFromTextNode
      );

    if (objectAndCidConfig.object) {
      this.cacheService.setCidConfig(objectAndCidConfig.cidConfig);
      this.cacheService.draft.setDraft(objectId, objectAndCidConfig.object);
    }
    
    return objectAndCidConfig.object;
  }

  setDraft(
    serviceProvider: string,
    objectId: string,
    draft: any
  ): Promise<any> {
    
    return this.serviceProviders[serviceProvider].service.draft.setDraft(objectId, draft);
    
    /** without the fallback for the get draft, the set should not be optimistic 
    return this.optimisticUpdate(
      serviceProvider,
      service => service.draft.setDraft(objectId, draft),
      this.linksFromTextNode(draft),
      `Draft of ${objectId}`
    );
    */
  }
}

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
    return this.cachedDiscover(
      dataId,
      service => service.data.getData(dataId),
      (service, data) => service.data.createData(data),
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
    const sourceGetter = () =>
      this.getFromSource(
        serviceProvider,
        service => service.draft.getDraft(objectId),
        this.linksFromTextNode
      );

    return this.fallback(
      sourceGetter,
      (service, draft) => service.draft.setDraft(objectId, draft),
      service => service.draft.getDraft(objectId)
    );
  }

  setDraft(
    serviceProvider: string,
    objectId: string,
    draft: any
  ): Promise<any> {
    return this.optimisticUpdate(
      serviceProvider,
      service => service.draft.setDraft(objectId, draft),
      this.linksFromTextNode(draft),
      `Draft of ${objectId}`
    );
  }
}

import { DiscoveryProvider } from './multiplatform';
import { DataService } from '../data.service';
import { TextNode, Dictionary } from '../../types';
import { DraftService } from '../draft.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { DataLocal } from '../local/data.local';
import { DraftLocal } from '../local/draft.local';

export interface DataProvider {
  data: DataService<TextNode>;
  draft: DraftService;
}

export class DataMultiplatform extends CachedMultiplatform<DataProvider> {
  constructor(serviceProviders: Dictionary<DiscoveryProvider<DataProvider>>) {
    super(serviceProviders, { data: new DataLocal(), draft: new DraftLocal() });
  }

  getData(dataId: string): Promise<TextNode> {
    return this.cachedDiscover(
      dataId,
      service => service.data.getData(dataId),
      (service, data) => service.data.createData(data),
      data => data.links.map(link => link.link)
    );
  }

  createData(serviceProvider: string, data: TextNode): Promise<string> {
    return this.optimisticCreate(
      serviceProvider,
      data,
      (service, object) => service.data.createData(object),
      data.links.map(link => link.link)
    );
  }

  async getDraft(serviceProvider: string, objectId: string): Promise<TextNode> {
    return this.getFromSource(
      serviceProvider,
      service => service.draft.getDraft(objectId),
      draft => draft.links.map(link => link.link)
    );
  }

  setDraft(
    serviceProvider: string,
    objectId: string,
    draft: any
  ): Promise<any> {
    return this.getServiceProvider(serviceProvider).draft.setDraft(
      objectId,
      draft
    );
  }
}

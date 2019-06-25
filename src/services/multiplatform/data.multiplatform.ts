import { DiscoveryProvider } from './multiplatform';
import { DataService } from '../data.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { DataLocal } from '../local/data.local';
import { Dictionary } from './../../types';

export class DataMultiplatform extends CachedMultiplatform<DataService>
  implements DataService {
  getCidConfig(): import("../cid.config").CidConfig {
    throw new Error('Method not implemented.');
  }
  setCidConfig(_cidConfig: import("../cid.config").CidConfig): void {
    throw new Error('Method not implemented.');
  }
  
  linksFromTextNode = node => node.links.map(link => link.link);

  defaultService: string;

  constructor(
    serviceProviders: Dictionary<DiscoveryProvider<DataService>>,
    defaultService: string
  ) {
    super(serviceProviders, new DataLocal());
    this.defaultService = defaultService;
  }

  getData<T>(dataId: string): Promise<T> {
    return this.cachedDiscover(
      dataId,
      service => service.getData(dataId),
      (service, data) => service.createData({ ...data, id: dataId }),
      this.linksFromTextNode
    );
  }

  createData<T>(data: T): Promise<string> {
    return this.createDataIn(this.defaultService, data);
  }
  
  createDataIn<T>(serviceProvider: string, data: T): Promise<string> {
    this.cacheService.setCidConfig(
      this.serviceProviders[serviceProvider].service.getCidConfig()
    );
    /** prevent old ids conflicts */
    delete data['id'];
    return this.optimisticCreate(
      serviceProvider,
      data,
      (service, object) => service.createData(object),
      this.linksFromTextNode(data)
    );
  }
}

import { DiscoveryProvider } from './multiplatform';
import { DataService } from '../data.service';
import { CachedMultiplatform } from './cached.multiplatform';
import { DataLocal } from '../local/data.local';
import { Dictionary } from './../../types';

export class DataMultiplatform extends CachedMultiplatform<DataService> {
  linksFromTextNode = node => node.links.map(link => link.link);

  constructor(serviceProviders: Dictionary<DiscoveryProvider<DataService>>) {
    super(serviceProviders, new DataLocal());
  }

  getData<T>(dataId: string): Promise<T> {
    let clonner = (service, objectAndCidConfig):Promise<any> => {
      service.setCidConfig(objectAndCidConfig.cidConfig);
      return service.createData(objectAndCidConfig.object);
    }
    return this.cachedDiscover(
      dataId,
      service => service.getData(dataId),
      clonner,
      this.linksFromTextNode
    );
  }

  createData<T>(serviceProvider: string, data: T): Promise<string> {
    this.cacheService.setCidConfig(
      this.serviceProviders[serviceProvider].service.getCidConfig()
    );
    return this.optimisticCreate(
      serviceProvider,
      data,
      (service, object) => service.createData(object),
      this.linksFromTextNode(data)
    );
  }
}

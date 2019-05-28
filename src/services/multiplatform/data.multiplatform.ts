import { Multiplatform } from './multiplatform';
import { DataService } from '../data.service';

export class DataMultiplatform extends Multiplatform<DataService>
  implements DataService {

  getData(dataId: string): Promise<any> {
    return this.discover(
      dataId,
      (service: DataService, hash: string) => service.getData(hash),
      data => {
        if (data.links) {
          return data.links.map(link => link.link);
        } else {
          return [];
        }
      }
    );
  }

  createData(data: any): Promise<string> {
    // TODO: How to create data in one service provider or the other?
    const serviceProvider = Object.keys(this.serviceProviders)[0];
    return this.serviceProviders[serviceProvider].service.createData(data);
  }
}

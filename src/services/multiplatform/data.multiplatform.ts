import { Multiplatform } from './multiplatform';
import { DataService } from '../data.service';
import { TextNode } from '../../types';

export class DataMultiplatform extends Multiplatform<DataService<TextNode>>
  implements DataService<TextNode> {

  getData(dataId: string): Promise<TextNode> {
    return this.discover(
      dataId,
      (service, hash) => service.getData(hash),
      data => data.links.map(link => link.link)
    );
  }

  createData(data: TextNode): Promise<string> {
    // TODO: How to create data in one service provider or the other?
    const serviceProvider = Object.keys(this.serviceProviders)[0];
    return this.serviceProviders[serviceProvider].service.createData(data);
  }
}

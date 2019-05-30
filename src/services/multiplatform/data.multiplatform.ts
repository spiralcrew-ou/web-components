import { Multiplatform } from './multiplatform';
import { DataService, WorkingData } from '../data.service';
import { TextNode } from '../../types';

export class DataMultiplatform extends Multiplatform<DataService<TextNode>>
  implements DataService<TextNode> {
  getWorkingData(dataId: string): Promise<WorkingData<TextNode>> {
    return this.discover(
      dataId,
      (service, hash) => service.getWorkingData(hash),
      workingData => [
        ...workingData.data.links.map(link => link.link),
        ...workingData.draft.links.map(link => link.link)
      ]
    );
  }

  createData(data: TextNode): Promise<string> {
    // TODO: How to create data in one service provider or the other?
    const serviceProvider = Object.keys(this.serviceProviders)[0];
    return this.serviceProviders[serviceProvider].service.createData(data);
  }
  
  updateDraft(dataId: string, draft: TextNode): Promise<void> {
    // TODO: How to create data in one service provider or the other?
    const serviceProvider = Object.keys(this.serviceProviders)[0];
    return this.serviceProviders[serviceProvider].service.updateDraft(
      dataId,
      draft
    );
  }
}

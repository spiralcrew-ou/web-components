import { Multiplatform } from './multiplatform';
import { DataService } from '../data.service';
import { TextNode, Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { DraftService } from '../draft.service';

export class DataMultiplatform extends Multiplatform<DataService<TextNode>> {

  constructor(
    serviceProviders: Dictionary<{
      service: DataService;
      discovery: DiscoveryService;
      draft: DraftService;
    }>
  ) {
    super(serviceProviders);
  }

  getData(dataId: string): Promise<TextNode> {
    return this.discoverObject(
      dataId,
      (service, hash) => service.getData(hash),
      data => data.links.map(link => link.link)
    );
  }

  createData(serviceProvider: string, data: TextNode): Promise<string> {
    return this.createWithLinks(
      serviceProvider,
      service => service.createData(data),
      data.links.map(link => link.link)
    );
  }

  async getDraft(serviceProvider: string, objectId: string): Promise<TextNode> {
    const draft = await this.serviceProviders[serviceProvider]['draft'].getDraft(objectId);

    if (draft) {
      await this.discoverLinksSources(
        draft.links.map(link => link.link),
        serviceProvider
      );
    }

    return draft;
  }

  setDraft(serviceProvider: string, objectId: string, draft: any): Promise<any> {
    return this.serviceProviders[serviceProvider]['draft'].setDraft(objectId, draft);
  }
}

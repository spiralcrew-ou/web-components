import { Multiplatform } from './multiplatform';
import { DataService } from '../data.service';
import { TextNode, Dictionary } from '../../types';
import { DiscoveryService } from '../discovery.service';
import { DraftService } from '../draft.service';

export class DataMultiplatform extends Multiplatform<DataService<TextNode>>
  implements DataService<TextNode>, DraftService {
  draftService: DraftService<TextNode>;
  defaultServiceProvider: string;

  constructor(
    serviceProviders: Dictionary<{
      service: DataService;
      discovery: DiscoveryService;
    }>,
    draftService: DraftService,
    defaultServiceProvider: string
  ) {
    super(serviceProviders);
    this.draftService = draftService;
    this.defaultServiceProvider = defaultServiceProvider;
  }

  getData(dataId: string): Promise<TextNode> {
    return this.discoverObject(
      dataId,
      (service, hash) => service.getData(hash),
      data => data.links.map(link => link.link)
    );
  }

  createData(data: TextNode): Promise<string> {
    return this.createWithLinks(
      this.defaultServiceProvider,
      service => service.createData(data),
      data.links.map(link => link.link)
    );
  }

  async getDraft(objectId: string): Promise<TextNode> {
    const draft = await this.draftService.getDraft(objectId);

    if (draft) {
      await this.discoverLinksSources(
        draft.links.map(link => link.link),
        this.defaultServiceProvider
      );
    }

    return draft;
  }

  setDraft(objectId: string, draft: any): Promise<any> {
    return this.draftService.setDraft(objectId, draft);
  }
}

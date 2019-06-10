import { DataService } from '../data.service';
import { HolochainConnection } from './holochain.connection';

export class DataHolochain<T = any> implements DataService<T> {
  documentsZome: HolochainConnection;

  constructor() {
    this.documentsZome = new HolochainConnection('test-instance', 'documents');
  }

  async getData(dataId: string): Promise<T> {
    const response = await this.documentsZome.call('get_text_node', {
      address: dataId
    });
    const entry = await this.documentsZome.parseEntryResult<T>(response);
    const data = entry.entry;
    if (data['links']) {
      data['links'] = data['links'].map(link => ({ link }));
    }
    return data;
  }
  
  createData(data: T): Promise<string> {
    if (data['links']) {
      data['links'] = data['links'].map(l => l.link);
    }
    return this.documentsZome.call('create_text_node', {
      node: data
    });
  }
}

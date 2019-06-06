import { DataService } from '../data.service';
import { HolochainConnection } from './holochain.connection';

export class DataHolochain<T = any> implements DataService<T> {
  documentsZome: HolochainConnection;

  constructor() {
    this.documentsZome = new HolochainConnection('test-instance', 'documents');
  }

  getData(dataId: string): Promise<T> {
    return this.documentsZome.call('get_text_node', { address: dataId });
  }

  createData(data: T): Promise<string> {
    return this.documentsZome.call('create_text_node', data);
  }
}

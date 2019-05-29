import { DataService } from '../data.service';
import { HolochainConnection } from './holochain.connection';

export class DataHolochain implements DataService {
  documentsZome: HolochainConnection;

  constructor() {
    this.documentsZome = new HolochainConnection('test-instance', 'documents');
  }

  getWorkingData(dataId: string): Promise<any> {
    return this.documentsZome
      .call('get_text_node', {
        address: dataId
      })
      .then(result => this.documentsZome.parseEntryResult<any>(result).entry);
  }

  createData(data: any): Promise<string> {
    return this.documentsZome.call('create_text_node', data);
  }
}

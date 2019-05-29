import { DataService } from '../data.service';
import { HolochainConnection } from './holochain.connection';
import { DraftsHolochain } from './drafts.holochain';

export class DataHolochain<T = any> implements DataService<T> {
  
  documentsZome: HolochainConnection;
  draftsHolochain = new DraftsHolochain<T>();

  constructor() {
    this.documentsZome = new HolochainConnection('test-instance', 'documents');
  }

  getData(dataId: string): Promise<T> {
    console.log(dataId);
    throw new Error("Method not implemented.");
  }

  createData(data: T): Promise<string> {
    return this.documentsZome.call('create_text_node', data);
  }

}

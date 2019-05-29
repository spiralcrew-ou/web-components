import { DataService, WorkingData } from '../data.service';
import { HolochainConnection } from './holochain.connection';
import { DraftsHolochain } from './drafts.holochain';

export class DataHolochain<T = any> implements DataService<T> {
  documentsZome: HolochainConnection;
  draftsHolochain = new DraftsHolochain<T>();

  constructor() {
    this.documentsZome = new HolochainConnection('test-instance', 'documents');
  }

  getWorkingData(dataId: string): Promise<WorkingData<T>> {
    return Promise.all([
      this.documentsZome.call('get_text_node', {
        address: dataId
      }),
      this.draftsHolochain.getDraft(dataId)
    ]).then(([result, draft]) => ({
      data: this.documentsZome.parseEntryResult<T>(result).entry,
      draft: draft
    }));
  }

  createData(data: T): Promise<string> {
    return this.documentsZome.call('create_text_node', data);
  }

  updateDraft(dataId: string, draft: T): Promise<void> {
    return this.draftsHolochain.setDraft(dataId, draft);
  }
}

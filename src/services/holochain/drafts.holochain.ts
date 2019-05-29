import { HolochainConnection } from './holochain.connection';
import { DraftsService } from '../drafts.service';

export class DraftsHolochain<T> implements DraftsService<T> {
  draftZome: HolochainConnection;

  constructor() {
    this.draftZome = new HolochainConnection('test-instance', 'draft');
  }

  getDraft(perspectiveId: string): Promise<T> {
    return this.draftZome.call('get_draft', {
      entry_address: perspectiveId
    });
  }

  setDraft(objectId: string, draft: any): Promise<void> {
    return this.draftZome.call('set_draft', {
      entry_address: objectId,
      draft: draft
    });
  }
}

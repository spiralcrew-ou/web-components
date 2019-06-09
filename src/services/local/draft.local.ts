import { DraftService } from '../draft.service';
import { insertDraft, getDraft, modifyDraft } from './dataservices';


export class DraftLocal<T> implements DraftService<T> {
   getDraft(objectId: string): Promise<T> {
    return getDraft(objectId)
  }

  async setDraft(objectId: string, draft: T): Promise<void> {
    if (!await this.getDraft(objectId)){
      draft['id'] = objectId
      return insertDraft(draft as any)
    }
    modifyDraft(draft as any)
    return draft as any
  }

}

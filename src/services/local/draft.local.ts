import { DraftService } from '../draft.service';
import {  getDraft, modifyDraft, insertDraft } from './dataservices';


export class DraftLocal<T> implements DraftService<T> {
   getDraft(objectId: string): Promise<T> {
    return getDraft(objectId)
  }

  async setDraft(objectId: string, draft: T): Promise<void> {
    draft['id'] = objectId
    if(!await getDraft(objectId)) insertDraft(draft as any)
    modifyDraft(draft as any)
    return draft as any
  }

}

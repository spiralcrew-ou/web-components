import { DraftService } from '../draft.service';
import { insertDraft, getDraft } from './dataservices';
import { TextNode } from '../../types';


export class DraftLocal<T> implements DraftService<T> {
  getDraft(objectId: string): Promise<T> {
    return getDraft(objectId);
  }

  async setDraft(objectId: string, draft: T): Promise<void> {
    return insertDraft(objectId, <TextNode>(<unknown>draft));
  }

}

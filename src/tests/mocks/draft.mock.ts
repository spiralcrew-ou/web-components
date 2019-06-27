import { DraftService } from '../../services/draft.service';

type Dictionary<T> = { [key: string]: T };

export class DraftMock implements DraftService {
  drafts: Dictionary<any> = {};

  getDraft(objectId: string): Promise<any> {
    return Promise.resolve(this.drafts[objectId]);
  }
  setDraft(objectId: string, draft: any): Promise<void> {
    this.drafts[objectId] = draft;
    return Promise.resolve();
  }
}

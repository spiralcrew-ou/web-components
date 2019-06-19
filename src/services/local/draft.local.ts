import { DraftService } from '../draft.service';
import { ExtensionsLocal } from './extensions.local';

export class DraftLocal<T> implements DraftService<T> {

  uprtclExtensions = new ExtensionsLocal<T>();

  getDraft(objectId: string): Promise<T> {
    return this.uprtclExtensions.drafts.get(objectId);
  }

  async setDraft(objectId: string, draft: T): Promise<void> {
    delete draft['id'];
    await this.uprtclExtensions.drafts.put(draft, objectId);
  }
}

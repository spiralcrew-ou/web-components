import { DraftService } from '../draft.service';
import {insertDraft,getDraft} from './dataservices';


export class DraftLocal<T> implements DraftService<T> {
    getDraft(objectId: string): Promise<T> {
        return getDraft(objectId)
    }    
    
    setDraft(objectId: string, draft: T): Promise<void> {
        draft['id']= objectId
        return insertDraft(draft as any)
    }  
}

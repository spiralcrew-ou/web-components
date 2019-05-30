import { DraftService } from '../draft.service';

export class DraftLocal<T> implements DraftService<T> {
    getDraft(objectId: string): Promise<T> {
        console.log(objectId);
        throw new Error("Method not implemented.");
    }    
    
    setDraft(objectId: string, draft: T): Promise<void> {
        console.log(objectId);
        console.log(draft);
        throw new Error("Method not implemented.");
    }  
}

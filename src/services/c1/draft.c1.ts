import { DraftService } from '../draft.service';
import { TextNode } from '../../types';
import { DataC1If, DraftC1 } from './data.if';
import { Http } from './http';
  
const http = new Http();

export class DraftsCollectiveOne implements DraftService {
    async getDraft(objectId: string): Promise<any> {
        return http.get<DataC1If>(`/draft/${objectId}`).then(dataC1 => {
            switch (dataC1.type) {
                case 'NODE':
                    const data = <TextNode> JSON.parse(dataC1.jsonData);
                    data.id = dataC1.id;
                    return data;
            }
            return null;
        });
    }    
    
    async setDraft(objectId: string, draft: any): Promise<void> {
        const draftC1 = new DraftC1();
        draftC1.elementId = objectId;
        draftC1.data = draft;
        const ids = await http.post('/draft', draftC1);
        return ids[0];
    }

}
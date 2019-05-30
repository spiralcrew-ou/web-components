import { DraftService } from '../draft.service';
import { TextNode } from '../../types';
import { Http } from './http';
  
const http = new Http();

interface DataC1 {
    id: string;
    type: string;
    jsonData: string;
}

export class DraftsCollectiveOne implements DraftService {
    async getDraft(objectId: string): Promise<any> {
        const dataC1 = await http.get<DataC1>(`/draft/${objectId}`);
        
        switch (dataC1.type) {
            case 'NODE':
                const data = <TextNode> JSON.parse(dataC1.jsonData);
                data.id = dataC1.id;
                return data;
        }

        return null;
    }    
    
    setDraft(objectId: string, draft: any): Promise<void> {
        console.log(draft);
        console.log(objectId);
        throw new Error("Method not implemented.");
    }

}
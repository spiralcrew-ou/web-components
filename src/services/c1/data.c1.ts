import { DataService } from '../data.service';
import { TextNode } from '../../types';
import { Http } from './http';
  
const http = new Http();

interface DataC1 {
    id: string;
    type: string;
    jsonData: string;
}

export class DataCollectiveOne implements DataService {

    async getData(dataId: string): Promise<any> {
        const dataC1 = await http.get<DataC1>(`/data/${dataId}`);
        
        switch (dataC1.type) {
            case 'NODE':
                const data = <TextNode> JSON.parse(dataC1.jsonData);
                data.id = dataC1.id;
                return data;
        }

        return null;
    }    
    
    createData(data: any): Promise<string> {
        console.log(data);
        throw new Error("Method not implemented.");
    }
   
}
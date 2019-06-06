import { DataService } from '../data.service';
import { TextNode } from '../../types';
import { DataC1If, DataC1 } from './data.if';
import { Http } from './http';
  
const http = new Http();

export class DataCollectiveOne implements DataService {

    async getData(dataId: string): Promise<any> {
        return http.get<DataC1If>(`/data/${dataId}`).then(dataC1 => {
            switch (dataC1.type) {
                case 'NODE':
                    const data = <TextNode> JSON.parse(dataC1.jsonData);
                    data.id = dataC1.id;
                    return data;
            }
            return null;
        });
    }    
    
    async createData(data: any): Promise<string> {
        const dataC1 = new DataC1();
        dataC1.type = 'NODE';
        dataC1.jsonData = JSON.stringify(data);
        return http.post('/data', [ dataC1 ]).then(ids => {
            return ids[0];
        })
    }
   
}
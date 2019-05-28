import { DataService } from '../data.service';

export class DataLocal implements DataService {
    constructor() {
    }
  
    getData(dataId: string): Promise<any> {
      console.log(dataId)
      return null
    }
  
    createData(data: any): Promise<string> {
      console.log(data)
      return null
    }
  }
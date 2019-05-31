import { DataService } from '../data.service';
import { TextNode } from '../../types';

export class DataLocal implements DataService {
  createData(data: TextNode): Promise<string> {
    console.log(data)
    throw new Error("Method not implemented.");
  }
  getData(dataId: string): Promise<TextNode> {
    console.log(dataId);
    throw new Error("Method not implemented.");
  }
}
import { DataService } from '../data.service';
import { TextNode } from '../../types';
import {insertTextNode,getTextNode} from '../local/dataservices';


export class DataLocal implements DataService {
  createData(data: TextNode): Promise<string> {
    return insertTextNode(data)
  }
  getData(dataId: string): Promise<TextNode> {
    return getTextNode(dataId)
  }
}
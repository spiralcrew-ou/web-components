import { DataService } from '../data.service';
import { TextNode } from '../../types';
import {insertTextNode,getTextNode} from '../local/dataservices';

//SHA2 256 para generar los ID
export class DataLocal implements DataService {
  createData(data: TextNode): Promise<string> {
    return insertTextNode(data)
  }
  getData(dataId: string): Promise<TextNode> {
    return getTextNode(dataId)
  }
}
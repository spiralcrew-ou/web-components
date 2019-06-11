import { DataService } from '../data.service';
import { TextNode as TextNodeIf } from '../../types';
import { insertTextNode, getTextNode, TextNode } from '../local/dataservices';

const BASE = 'base58btc';
const VERSION = 1;
const CODEC = 'raw';
const TYPE = 'sha3-256';
export class DataLocal implements DataService {
  
  createData(data: TextNodeIf): Promise<string> {
    let newData = new TextNode(data.text, data.links);
    newData.setId(BASE, VERSION, CODEC, TYPE);
    return insertTextNode(newData);
  }

  getData(dataId: string): Promise<TextNodeIf> {
    return getTextNode(dataId)
  }
}
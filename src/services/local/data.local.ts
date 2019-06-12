import { DataService } from '../data.service';
import { TextNode as TextNodeIf } from '../../types';
import { insertTextNode, getTextNode, TextNode } from '../local/dataservices';

import { c1Cid as cidConfig } from './cid.config';

export class DataLocal implements DataService {
  
  async createData(data: TextNodeIf): Promise<string> {
    let newData = new TextNode(data.text, data.links);
    await newData.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);
    return insertTextNode(newData);
  }

  getData(dataId: string): Promise<TextNodeIf> {
    return getTextNode(dataId)
  }
}
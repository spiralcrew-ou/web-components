import { DataService } from '../data.service';
import { TextNode as TextNodeIf } from '../../types';
import { insertTextNode, getTextNode } from '../local/dataservices';
import { TextNode } from '../../objects';

import { c1Cid as cidConfig } from './cid.config';

export class DataLocal implements DataService {
  async createData(data: TextNodeIf): Promise<string> {
    let newData = new TextNode(data.text, data.type, data.links);
    await newData.setId(
      cidConfig.base,
      cidConfig.version,
      cidConfig.codec,
      cidConfig.type
    );
    const exists = await this.existData(newData.id);
    return !exists ? insertTextNode(newData) : Promise.resolve(newData.id);
  }

  getData(dataId: string): Promise<TextNodeIf> {
    return getTextNode(dataId);
  }

  async existData(_dataId: string): Promise<Boolean> {
    const dataId = await this.getData(_dataId);
    return dataId != null;
  }
}

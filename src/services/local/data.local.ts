import { DataService } from '../data.service';
import { TextNode as TextNodeIf } from '../../types';
import { insertTextNode, getTextNode } from '../local/dataservices';
import { TextNode } from '../../objects';
import { CidConfig } from './cid.config';
import { ipldService } from '../ipld';

export class DataLocal implements DataService {

  currentConfig: CidConfig;

  constructor(config: CidConfig) {
    this.currentConfig = config
  }

  generateCid(object: any, propertyOrder: string[]) {
    const plain = {};

    for (const key of propertyOrder) {
      plain[key] = object[key];
    }

    return ipldService.generateCid(
      JSON.stringify(plain),
      this.currentConfig
    );
  }

  async createData(data: TextNodeIf): Promise<string> {
    let newData = new TextNode(data.text, data.type, data.links);
    newData.id = await this.generateCid(newData, [
      'text',
      'type',
      'links'
    ]);
    
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

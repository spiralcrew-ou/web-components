import { DataService } from '../data.service';
import { CidConfig } from '../cid.config';
import { ipldService } from '../ipld';
import { ExtensionsLocal } from './extensions.local';

export class DataLocal<T> implements DataService<T> {

  currentConfig: CidConfig;
  uprtclExtensions = new ExtensionsLocal<T>();
  
  constructor() {
  }

  getCidConfig(): CidConfig {
    return this.currentConfig;
  }

  setCidConfig(config: CidConfig)  {
    this.currentConfig = config;
  }

  generateCid(object: any, propertyOrder: string[]) {
    const plain = {};

    for (const key of propertyOrder) {
      plain[key] = object[key];
    }

    return ipldService.generateCid(
     plain,
      this.currentConfig
    );
  }

  async createData(data: T): Promise<string> {
    const dataId = await this.generateCid(data, ['text', 'type', 'links']);
    data['id'] = dataId;
    this.uprtclExtensions.data.put(data);
    return dataId;
  }

  getData(dataId: string): Promise<T> {
    return this.uprtclExtensions.data.get(dataId);
  }

  async existData(_dataId: string): Promise<Boolean> {
    const dataId = await this.getData(_dataId);
    return dataId != null;
  }
}
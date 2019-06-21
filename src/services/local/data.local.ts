import { DataService } from '../data.service';
import { CidConfig } from '../cid.config';
import { ipldService } from '../ipld';
import { ExtensionsLocal } from './extensions.local';
import { PropertyOrder } from './../../types';

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

  async createData(data: T): Promise<string> {
    const dataId = await ipldService.generateCidOrdered(
      data,
      this.currentConfig,
      PropertyOrder.TextNode
    );
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
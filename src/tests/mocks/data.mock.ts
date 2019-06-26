import { TextNode, Position } from '../../types';
import { CidConfig } from '../../services/cid.config';
import { DataService } from '../../services/data.service';
import { BaseMock } from './base.mock';

type Dictionary<T> = { [key: string]: T };

export function sampleData(
  text: string,
  type: string = 'paragraph',
  links: Array<{ position?: Position; link: string }> = []
): TextNode {
  return { text, type, links };
}

export class MockData extends BaseMock implements DataService {
  datas: Dictionary<TextNode> = {};

  getCidConfig(): CidConfig {
    throw new Error('Method not implemented.');
  }

  getData(dataId: string): Promise<any> {
    return this.get(this.datas[dataId]);
  }
  createData(data: any): Promise<string> {
    const id = 'data' + Object.keys(this.datas).length + 1;
    this.datas[id] = { ...data, id };
    this.log('[DATA] Created data: ', this.datas[id]);
    return Promise.resolve(id);
  }
}

import { TextNode, Position } from '../../types';
import { CidConfig } from '../cid.config';
import { DataService } from '../data.service';

type Dictionary<T> = { [key: string]: T };

export function sampleData(
  text: string,
  type: string = 'paragraph',
  links: Array<{ position?: Position; link: string }> = []
): TextNode {
  return { text, type, links };
}

export class MockData implements DataService {
  datas: Dictionary<TextNode> = {};

  getCidConfig(): CidConfig {
    throw new Error('Method not implemented.');
  }
  setCidConfig(_cidConfig: CidConfig): void {
    throw new Error('Method not implemented.');
  }

  getData(dataId: string): Promise<any> {
    return Promise.resolve(this.datas[dataId]);
  }
  createData(data: any): Promise<string> {
    const id = 'data' + Object.keys(this.datas).length + 1;
    this.datas[id] = data;
    return Promise.resolve(id);
  }
}

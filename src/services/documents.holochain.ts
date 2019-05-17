import { DocumentsService } from './documents.service';
import { HolochainConnection } from './holochain.connection';
import { TextNode } from '../types';

export class DocumentsHolochain implements DocumentsService {
  documentsZome: HolochainConnection;

  constructor() {
    this.documentsZome = new HolochainConnection('test-instance', 'documents');
  }

  async getTextNode(nodeId: string): Promise<TextNode> {
    return await this.documentsZome
      .call('get_text_node', {
        address: nodeId
      })
      .then(
        result => this.documentsZome.parseEntryResult<TextNode>(result).entry
      );
  }

  createTextNode(node: TextNode): Promise<string> {
    return this.documentsZome.call('create_text_node', node);
  }

  resolve(link: string): Promise<any> {
    return this.getTextNode(link);
  }
}

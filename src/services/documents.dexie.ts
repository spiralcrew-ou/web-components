import { DocumentsService } from './documents.service';
import { TextNode } from '../types';
import Dexie from 'dexie';
import Buffer from 'buffer/';
import CID from 'cids';
import multihash from 'multihashes';

export class DocumentsDexie implements DocumentsService {
  db: any;

  constructor() {
    this.db = new Dexie('documents');
    this.db.version(0.1).stores({
      nodes: 'id'
    });
  }

  generateCid(object, idKey = 'id') {
    const objectWithoutId = {};
    for (const key of Object.keys(object)) {
      if (key !== idKey) {
        objectWithoutId[key] = object[key];
      }
    }

    const b = Buffer.Buffer.from(JSON.stringify(objectWithoutId));
    var encoded = multihash.encode(b, 'sha2-256');
    var cid = new CID(1, 'dag-pb', encoded);
    return cid.toString();
  }

  getTextNode(nodeId: string): Promise<TextNode> {
    return this.db.nodes.get(nodeId);
  }

  createTextNode(node: TextNode): Promise<string> {
    const id = this.generateCid(node);
    return this.db.nodes.add({ ...node, id: id }).then(() => id);
  }
}

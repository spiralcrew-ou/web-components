import { TextNode } from './types';
import { UprtclEntity } from './uprtcl.entity';
import { NodeEntity } from './node.entity';
import { TextEntity } from './text.entity';

export class TextNodeEntity extends UprtclEntity<TextNode> {
  nodeEntity: NodeEntity;
  textEntity: TextEntity;

  constructor(object: TextNode) {
    super(object);
    this.nodeEntity = new NodeEntity(object);
    this.textEntity = new TextEntity(object);
  }

  getProperties(): string[] {
    return this.nodeEntity
      .getProperties()
      .concat(this.textEntity.getProperties());
  }

  getContents() {
    return this.textEntity.getContents();
  }

  getLinks() {
    return this.nodeEntity.getLinks();
  }

  fork() {}
}

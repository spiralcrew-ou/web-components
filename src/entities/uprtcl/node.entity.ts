import { Node } from './types';
import { Dictionary } from '../types';
import { UprtclEntity } from './uprtcl.entity';

export class NodeEntity extends UprtclEntity<Node> {
  getProperties(): string[] {
    return ['links'];
  }

  getLinks(): Dictionary<string[]> {
    return { links: this.object.links };
  }
}

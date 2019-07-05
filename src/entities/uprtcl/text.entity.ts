import { UprtclEntity } from './uprtcl.entity';
import { Dictionary } from '../types';
import { Text } from './types';

export class TextEntity extends UprtclEntity<Text> {
  getProperties(): string[] {
    return ['text'];
  }

  getContents(): Dictionary<string> {
    return { text: this.object.text };
  }

  merge(withObject: Text) {
    
  }
}

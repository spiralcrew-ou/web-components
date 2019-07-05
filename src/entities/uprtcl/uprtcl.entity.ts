import { Entity } from '../entity';

export class UprtclEntity<T extends object> extends Entity<T> {
  fork() {
    throw new Error('Method not implemented.');
  }

  merge(withObject: T) {
    throw new Error('Method not implemented.');
  }
}

import { Dictionary } from './types';

export class Entity<T extends object> {
  constructor(protected object: T) {}

  isEntity() {
    const properties = this.getProperties();
    let unseenProperties = properties.length;

    for (const key in this.object) {
      if (!properties.includes(key)) {
        return false;
      }
      unseenProperties--;
    }
    return unseenProperties === 0;
  }

  getProperties(): string[] {
    return [];
  }

  getLinks(): Dictionary<string[]> {
    return {};
  }
  getContents(): Dictionary<string> {
    return {};
  }
}

import Dexie from 'dexie';
import { DiscoveryService } from '../discovery.service';

export class DiscoveryLocal implements DiscoveryService {
  knownSources: Dexie.Table<string[], string>;

  constructor() {    
    const db = new Dexie('knownsources');
    db.version(0.1).stores({
      knownsources: 'id'
    });

    this.knownSources = db.table('knownsources');
  }

  getKnownSources(hash: string): Promise<string[]> {
    return this.knownSources.get(hash);
  }

  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    let knownSources = await this.knownSources.get(hash);
    if (!knownSources) {
      knownSources = [];
    }
    for (const source of sources) {
      if (!knownSources.includes(source)) {
        knownSources.push(source);
      }
    }

    await this.knownSources.put(knownSources, hash);
  }

  async removeKnownSource(hash: string, source: string): Promise<void> {
    let knownSources = await this.knownSources.get(hash);
    knownSources = knownSources.filter(s => s !== source);

    await this.knownSources.put(knownSources, hash);
  }
}

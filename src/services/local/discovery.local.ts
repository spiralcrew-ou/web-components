import { DiscoveryService } from '../discovery.service';
import {
  insertKnownSources,
  getKnownSources
} from './dataservices';

import {
  KnownSources
} from './../../objects';

export class DiscoveryLocal implements DiscoveryService {
  constructor() {}

  getOwnSource(): Promise<string> {
    return Promise.resolve('local');
  }

  getKnownSources(hash: string): Promise<string[]> {
    return getKnownSources(hash);
  }

  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    await insertKnownSources(new KnownSources(hash, sources));
  }

  async removeKnownSource(hash: string, source: string): Promise<void> {
    let knownSources = await this.getKnownSources(hash);
    knownSources = knownSources.filter(s => s !== source);

    await insertKnownSources(new KnownSources(hash, knownSources));
  }
}

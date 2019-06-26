import { DiscoveryService } from '../../services/discovery.service';

type Dictionary<T> = {[key: string]: T};

export class DiscoveryMock implements DiscoveryService {

  knownSources: Dictionary<string[]> = {}

  sourceName: string;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }
  
  getOwnSource(): Promise<string> {
    return Promise.resolve(this.sourceName);
  }

  getKnownSources(hash: string): Promise<string[]> {
    return Promise.resolve(this.knownSources[hash]);
  }

  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    if (!sources || sources.length === 0) {
      return;
    }

    const knownSources = await this.getKnownSources(hash);
    const newSources = new Set([].concat(sources).concat(knownSources));

    this.knownSources[hash] = Array.from(newSources).filter(d => d);
  }

  async removeKnownSource(hash: string, source: string): Promise<void> {
    let knownSources = await this.getKnownSources(hash);
    knownSources = knownSources.filter(s => s !== source);
    if (knownSources.length === 0){
      this.knownSources[hash] = null;
      delete this.knownSources[hash];
    } else {
      this.knownSources[hash] = knownSources;
    }
  }
}

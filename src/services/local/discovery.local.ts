import { DiscoveryService } from '../discovery.service';
import {insertKnownSources,getKnownSources, KnownSources} from './dataservices'

export class DiscoveryLocal implements DiscoveryService {

  constructor() {   
    
  }

  getKnownSources(hash: string): Promise<string[]> {
    return getKnownSources(hash)
  }

  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    /*
    let knownSources = await this.knownSources.get(hash);
    if (!knownSources) {
      knownSources = [];
    }
    for (const source of sources) {
      if (!knownSources.includes(source)) {
        knownSources.push(source);
      }
    }*/
    await insertKnownSources(new KnownSources(hash,sources))

    //await this.knownSources.put(knownSources, hash);
  }

  async removeKnownSource(_hash: string, _source: string): Promise<void> {
    /*
    let knownSources = await this.knownSources.get(hash);
    knownSources = knownSources.filter(s => s !== source);

    await this.knownSources.put(knownSources, hash);*/
    throw new Error("Method not implemented.");
  }
  
  
}

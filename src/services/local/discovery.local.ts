import { DiscoveryService } from '../discovery.service';
import { ExtensionsLocal } from './extensions.local';

export class DiscoveryLocal implements DiscoveryService {
  uprtclExtensions = new ExtensionsLocal();
  
  getOwnSource(): Promise<string> {
    return Promise.resolve('local');
  }

  getKnownSources(hash: string): Promise<string[]> {
    return this.uprtclExtensions.knownSources.get(hash);
  }

  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    const knownSources = await this.getKnownSources(hash);
    const newSources = new Set([].concat(knownSources).concat(sources));

    await this.uprtclExtensions.knownSources.put(
      Array.from(newSources).filter(d => d),
      hash
    );
  }

  async removeKnownSource(hash: string, source: string): Promise<void> {
    let knownSources = await this.getKnownSources(hash);
    knownSources = knownSources.filter(s => s !== source);

    await this.uprtclExtensions.knownSources.put(knownSources, hash);
  }
}

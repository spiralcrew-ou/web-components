import { DiscoveryService } from '../discovery.service';
import { HolochainConnection } from './holochain.connection';

export class DiscoveryHolochain implements DiscoveryService {
  discoveryZome: HolochainConnection;

  constructor() {
    this.discoveryZome = new HolochainConnection('test-instance', 'discovery');
  }

  getKnownSources(hash: string): Promise<string[]> {
    return this.discoveryZome.call('get_known_sources', { address: hash });
  }
  addKnownSources(hash: string, sources: string[]): Promise<void> {
    return this.discoveryZome.call('get_known_sources', {
      address: hash,
      sources: sources
    });
  }
  removeKnownSource(hash: string, source: string): Promise<void> {
    return this.discoveryZome.call('get_known_sources', {
      address: hash,
      source: source
    });
  }
}
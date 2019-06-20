import { DiscoveryService } from '../discovery.service';

export class DiscoveryEthereum implements DiscoveryService {
  constructor() {}

  getOwnSource(): Promise<string> {
    return Promise.resolve('eth://smartContract');
  }

  async getKnownSources(hash: string): Promise<string[]> {
    console.log('[ETH DISCOVERY] I am actually ignoring your hash', { hash })
    let ownsource = await this.getOwnSource();
    return Promise.resolve([ownsource]);
  }
  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    console.log('[ETH DISCOVERY] I dont know how to do this, sorry', { hash, sources })
    return Promise.resolve();
  }
  removeKnownSource(hash: string, source: string): Promise<void> {
    console.error('METHOD NOT IMPLEMENTED' + hash + source);
    return Promise.resolve();
  }
}

import { DiscoveryService } from '../discovery.service';
import { http } from './http';

export class DiscoveryCollectiveOne implements DiscoveryService {
  constructor() {}

  getOwnSource(): Promise<string> {
    return http.get('/discovery/you');
  }

  getKnownSources(hash: string): Promise<string[]> {
    return http.get(`/discovery/${hash}`);
  }
  async addKnownSources(hash: string, sources: string[]): Promise<void> {
    
    if(!sources) {
      console.error('[C1 DISCOVER]: Warning, sources null');
      return Promise.reject('sources is null');
    }

    let nonNullElements = sources.filter(source => source !== null);
    if (nonNullElements.length < sources.length) {
      console.error('[C1 DISCOVER]: Warning, known source null');
    }

    await http.put(`/discovery/${hash}`, sources);
  }
  removeKnownSource(_hash: string, _source: string): Promise<void> {
    return Promise.resolve();
  }
}

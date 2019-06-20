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
    await http.put(`/discovery/${hash}`, sources);
  }
  removeKnownSource(_hash: string, _source: string): Promise<void> {
    return Promise.resolve();
  }
}

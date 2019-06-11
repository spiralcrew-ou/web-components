import { DiscoveryService } from '../discovery.service';
import { http } from './http';

export class DiscoveryCollectiveOne implements DiscoveryService {

  constructor() {
  }

  getOwnSource(): Promise<string> {
    return http.get('/discovery/you');
  }

  getKnownSources(hash: string): Promise<string[]> {
    return http.get(`/discovery/${hash}`);
  }
  addKnownSources(hash: string, sources: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      http.put(`/discovery/${hash}`, sources).then(() => {
        resolve();
      })
    });
  }
  removeKnownSource(hash: string, source: string): Promise<void> {
    console.log(hash);
    console.log(source);
    return Promise.resolve();
  }
}

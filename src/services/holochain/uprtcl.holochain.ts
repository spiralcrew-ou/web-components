import { UprtclService } from '../uprtcl.service';
import { HolochainConnection, EntryResult } from './holochain.connection';
import { Perspective, Commit, Context } from '../../types';
import { CidConfig } from '../cid.config';

export class UprtclHolochain implements UprtclService {
  uprtclZome: HolochainConnection;
  proxyZome: HolochainConnection;
  cidConfig: CidConfig;

  constructor() {
    this.uprtclZome = new HolochainConnection('test-instance', 'uprtcl');
    this.proxyZome = new HolochainConnection('test-instance', 'proxy');
    this.cidConfig = new CidConfig('base58btc', 0, 'dag-pb', 'sha2-256');
  }

  splitId(object: any) {
    let id = null;
    const result = {};
    for (const key of Object.keys(object)) {
      if (key === 'id') {
        id = object[key];
      } else {
        result[key] = object[key];
      }
    }

    return { object, id };
  }

  getEntry(entryId: string): Promise<EntryResult> {
    return this.proxyZome
      .call('get_proxied_entry', { address: entryId })
      .then(entry => this.uprtclZome.parseEntryResult(entry));
  }

  getCidConfig(): CidConfig {
    return this.cidConfig;
  }

  setCidConfig(): CidConfig {
    throw new Error('Holochain Cid version is fixed for the moment');
  }
  
  getContext(contextId: string): Promise<Context> {
    return this.getEntry(contextId).then(result => result.entry);
  }

  getPerspective(perspectiveId: string): Promise<Perspective> {
    return this.getEntry(perspectiveId).then(result => result.entry);
  }

  getCommit(commitId: string): Promise<Commit> {
    return this.getEntry(commitId).then(result => result.entry);
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    const perspectivesResponse = await this.uprtclZome.call(
      'get_context_perspectives',
      {
        context_address: contextId
      }
    );

    const perspectivesEntries: EntryResult<
      Perspective
    >[] = this.uprtclZome.parseEntriesResults(perspectivesResponse);
    return perspectivesEntries.map(p => p.entry);
  }

  createContext(context: Context): Promise<string> {
    const { object, id } = this.splitId(context);
    return this.uprtclZome.call('create_context', {
      previous_address: id,
      context: object
    });
  }

  createPerspective(perspective: Perspective): Promise<string> {
    const { object, id } = this.splitId(perspective);
    return this.uprtclZome.call('create_perspective', {
      previous_address: id,
      perspective: object
    });
  }

  createCommit(commit: Commit): Promise<string> {
    const { object, id } = this.splitId(commit);
    return this.uprtclZome.call('create_commit', {
      previous_address: id,
      commit: object
    });
  }

  async getHead(perspectiveId: string): Promise<string> {
    try {
      return await this.uprtclZome.call('get_perspective_head', {
        perspective_address: perspectiveId
      });
    } catch (e) {
      if (e.message !== '{"Internal":"given perspective has no commits"}') {
        throw new Error(e);
      }
      return null;
    }
  }

  updateHead(perspectiveId: string, headId: string): Promise<void> {
    return this.uprtclZome.call('update_perspective_head', {
      perspective_address: perspectiveId,
      head_address: headId
    });
  }
}

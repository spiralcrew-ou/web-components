import { UprtclService } from '../uprtcl.service';
import { HolochainConnection, EntryResult } from './holochain.connection';
import { Perspective, Commit, Context, PropertyOrder } from '../../types';
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

  splitId(object: any, propertyOrder: string[]) {
    let id = object['id'];
    const result = {};
    for (const key of propertyOrder) {
      result[key] = object[key];
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

  getContext(contextId: string): Promise<Context> {
    return this.getEntry(contextId).then(result =>
      result ? result.entry : null
    );
  }

  getPerspective(perspectiveId: string): Promise<Perspective> {
    return this.getEntry(perspectiveId).then(result =>
      result ? result.entry : null
    );
  }

  getCommit(commitId: string): Promise<Commit> {
    return this.getEntry(commitId).then(result =>
      result ? result.entry : null
    );
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
    return perspectivesEntries.map(p => (p ? p.entry : null));
  }

  createContext(context: Context): Promise<string> {
    const { object, id } = this.splitId(context, PropertyOrder.Context);
    return this.uprtclZome.call('create_context', {
      previous_address: id,
      context: object
    });
  }

  createPerspective(perspective: Perspective): Promise<string> {
    const { object, id } = this.splitId(perspective, PropertyOrder.Perspective);
    return this.uprtclZome.call('create_perspective', {
      previous_address: id,
      perspective: object
    });
  }

  createCommit(commit: Commit): Promise<string> {
    const { object, id } = this.splitId(commit, PropertyOrder.Commit);
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

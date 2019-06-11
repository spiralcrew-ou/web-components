import { UprtclService } from '../uprtcl.service';
import { HolochainConnection, EntryResult } from './holochain.connection';
import { ConnectionFormatter } from './connection-formatter';
import { Perspective, Commit, Context } from '../../types';

export class UprtclHolochain implements UprtclService {
  uprtclZome: HolochainConnection;
  formatter: ConnectionFormatter;

  objectRelation = {
    context: {
      creatorId: 'creator'
    },
    perspective: {
      creatorId: 'creator',
      contextId: 'context_address',
      headId: 'head_address'
    },
    commit: {
      creatorId: 'creator',
      parentsIds: 'parent_commits_addresses',
      dataId: 'content_address'
    }
  };

  constructor() {
    this.formatter = new ConnectionFormatter(this.objectRelation);
    this.uprtclZome = new HolochainConnection('test-instance', 'uprtcl');
  }

  getEntry(entryId: string): Promise<EntryResult> {
    return this.uprtclZome
      .call('get_entry', { address: entryId })
      .then(entry => this.uprtclZome.parseEntryResult(entry));
  }

  getRootContextId(): Promise<string> {
    return this.uprtclZome
      .call('get_root_context_id', {})
      .then(result => (result.Ok ? result.Ok : result));
  }

  getContext(contextId: string): Promise<Context> {
    return this.getEntry(contextId).then(result =>
      this.formatter.formatServerToUi<Context>('context', result.entry)
    );
  }

  async getPerspectiveHead(perspectiveId: string): Promise<string> {
    let headId = null;
    try {
      headId = await this.uprtclZome.call('get_perspective_head', {
        perspective_address: perspectiveId
      });
    } catch (e) {
      if (e.message !== '{"Internal":"given perspective has no commits"}') {
        throw new Error(e);
      }
    }
    return headId;
  }

  getPerspective(perspectiveId: string): Promise<Perspective> {
    return Promise.all([
      this.getEntry(perspectiveId),
      this.getPerspectiveHead(perspectiveId)
    ]).then(([result, headAddress]: [EntryResult, string]) => {
      const perspective = result.entry;
      perspective['head_address'] = headAddress;
      return this.formatter.formatServerToUi<Perspective>(
        'perspective',
        perspective
      );
    });
  }

  getCommit(commitId: string): Promise<Commit> {
    return this.getEntry(commitId).then(result =>
      this.formatter.formatServerToUi<Commit>('commit', result.entry)
    );
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    const perspectivesResponse = await this.uprtclZome.call(
      'get_context_perspectives',
      {
        context_address: contextId
      }
    );

    const perspectivesEntries = this.uprtclZome.parseEntriesResults(
      perspectivesResponse
    );
    let perspectives = perspectivesEntries.map(p =>
      this.formatter.formatServerToUi<Perspective>('perspective', p.entry)
    );

    return await Promise.all(
      perspectives.map(async perspective => {
        const headId = await this.getPerspectiveHead(perspective.id);
        perspective.headId = headId;
        return perspective;
      })
    );
  }

  createContext(timestamp: number, nonce: number): Promise<string> {
    return this.uprtclZome.call('create_context', {
      timestamp: timestamp,
      nonce: nonce
    });
  }

  createPerspective(
    contextId: string,
    name: string,
    timestamp: number,
    headId: string
  ): Promise<string> {
    return this.uprtclZome.call('create_perspective', {
      context_address: contextId,
      name: name,
      timestamp: timestamp,
      head_address: headId
    });
  }

  createCommit(
    timestamp: number,
    message: string,
    parentsIds: string[],
    dataId: string
  ): Promise<string> {
    return this.uprtclZome.call('create_commit', {
      message: message,
      timestamp: timestamp,
      parent_commits_addresses: parentsIds,
      content_address: dataId
    });
  }

  cloneContext(context: Context): Promise<string> {
    return this.uprtclZome.call('clone_context', {
      context
    });
  }

  clonePerspective(perspective: Perspective): Promise<string> {
    return this.uprtclZome.call('clone_perspective', {
      perspective
    });
  }

  cloneCommit(commit: Commit): Promise<string> {
    return this.uprtclZome.call('clone_commit', {
      commit
    });
  }

  updateHead(perspectiveId: string, headId: string): Promise<void> {
    return this.uprtclZome.call('update_perspective_head', {
      perspective_address: perspectiveId,
      head_address: headId
    });
  }
}

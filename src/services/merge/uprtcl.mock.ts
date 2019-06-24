import { UprtclService } from '../uprtcl.service';
import { Context, Perspective, Commit } from '../../types';
import { CidConfig } from '../cid.config';

type Dictionary<T> = { [key: string]: T };

export function sampleContext(
  creatorId = 'anon',
  nonce = 0,
  timestamp = Date.now()
): Context {
  return { timestamp, nonce, creatorId };
}

export function samplePerspective(
  contextId: string,
  name = 'perspective',
  origin = 'someOrigin',
  creatorId = 'anon',
  timestamp = Date.now()
): Perspective {
  return { timestamp, name, creatorId, contextId, origin };
}

export function sampleCommit(
  dataId: string,
  parentsIds: string[] = [],
  message = 'message',
  creatorId = 'anon',
  timestamp = Date.now()
): Commit {
  return { parentsIds, message, timestamp, dataId, creatorId };
}

export class MockUprtcl implements UprtclService {
  contexts: Dictionary<Context> = {};
  perspectives: Dictionary<Perspective> = {};
  commits: Dictionary<Commit> = {};
  heads: Dictionary<string> = {};

  getCidConfig(): CidConfig {
    throw new Error('Method not implemented.');
  }
  setCidConfig(_cidConfig: CidConfig): void {
    throw new Error('Method not implemented.');
  }

  getContext(contextId: string): Promise<Context> {
    return Promise.resolve(this.contexts[contextId]);
  }
  getPerspective(perspectiveId: string): Promise<Perspective> {
    return Promise.resolve(this.perspectives[perspectiveId]);
  }
  getCommit(commitId: string): Promise<Commit> {
    return Promise.resolve(this.commits[commitId]);
  }

  getContextPerspectives(contextId: string): Promise<Perspective[]> {
    return Promise.resolve(
      Object.keys(this.perspectives)
        .filter(
          perspectiveId =>
            this.perspectives[perspectiveId].contextId === contextId
        )
        .map(id => this.perspectives[id])
    );
  }
  createContext(context: Context): Promise<string> {
    const id = 'context' + Object.keys(this.contexts).length + 1;
    this.contexts[id] = context;
    return Promise.resolve(id);
  }
  createPerspective(perspective: Perspective): Promise<string> {
    const id = 'perspective' + Object.keys(this.perspectives).length + 1;
    this.perspectives[id] = perspective;
    return Promise.resolve(id);
  }
  createCommit(commit: Commit): Promise<string> {
    const id = 'commit' + Object.keys(this.commits).length + 1;
    this.commits[id] = commit;
    return Promise.resolve(id);
  }
  updateHead(perspectiveId: string, commitId: string): Promise<void> {
    this.heads[perspectiveId] = commitId;
    return Promise.resolve();
  }
  getHead(perspectiveId: string): Promise<string> {
    return Promise.resolve(this.heads[perspectiveId]);
  }
}

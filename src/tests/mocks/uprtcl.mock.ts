import { UprtclService } from '../../services/uprtcl.service';
import { Context, Perspective, Commit, TextNode } from '../../types';
import { BaseMock } from './base.mock';
import { userService } from '../../services/user/user.service.imp';
import { CidConfig } from '../../services/cid.config';

type Dictionary<T> = { [key: string]: T };

export type Node = [string, NodeTree];

export interface NodeTree extends Array<Node> {}

export type History = [Commit, HistoryArray];
export interface HistoryArray extends Array<History> {}

export interface Content {
  perspective: Perspective;
  context: Context;
  commit: Commit;
  data: TextNode;
}

export function sampleContext(
  creatorId = userService.getUsername(),
  nonce = 0,
  timestamp = Date.now()
): Context {
  return { timestamp, nonce, creatorId };
}

export function samplePerspective(
  contextId: string,
  name = 'perspective',
  origin = 'someOrigin',
  creatorId = userService.getUsername(),
  timestamp = Date.now()
): Perspective {
  return { timestamp, name, creatorId, contextId, origin };
}

export function sampleCommit(
  dataId: string,
  parentsIds: string[] = [],
  message = 'message',
  creatorId = userService.getUsername(),
  timestamp = Date.now()
): Commit {
  return { parentsIds, message, timestamp, dataId, creatorId };
}

export class MockUprtcl extends BaseMock implements UprtclService {
  contexts: Dictionary<Context> = {};
  perspectives: Dictionary<Perspective> = {};
  commits: Dictionary<Commit> = {};
  heads: Dictionary<string> = {};

  getCidConfig(): CidConfig {
    throw new Error('Method not implemented.');
  }

  getContext(contextId: string): Promise<Context> {
    return this.get(this.contexts[contextId]);
  }
  getPerspective(perspectiveId: string): Promise<Perspective> {
    return this.get(this.perspectives[perspectiveId]);
  }
  getCommit(commitId: string): Promise<Commit> {
    return this.get(this.commits[commitId]);
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
    const id = 'context' + (Object.keys(this.contexts).length + 1);
    this.contexts[id] = { ...context, id };
    this.log('[UPRCTL] Created context:', this.contexts[id]);
    return Promise.resolve(id);
  }
  createPerspective(perspective: Perspective): Promise<string> {
    const id = 'perspective' + (Object.keys(this.perspectives).length + 1);
    this.perspectives[id] = { ...perspective, id };
    this.log('[UPRCTL] Created perspective:', this.perspectives[id]);
    return Promise.resolve(id);
  }
  createCommit(commit: Commit): Promise<string> {
    const id = 'commit' + (Object.keys(this.commits).length + 1);
    this.commits[id] = { ...commit, id };
    this.log('[UPRCTL] Created commit:', this.commits[id]);
    return Promise.resolve(id);
  }
  updateHead(perspectiveId: string, commitId: string): Promise<void> {
    this.heads[perspectiveId] = commitId;
    this.log(`[UPRCTL] Updated head of ${perspectiveId}: ${commitId}`);
    return Promise.resolve();
  }
  getHead(perspectiveId: string): Promise<string> {
    return Promise.resolve(this.heads[perspectiveId]);
  }
}

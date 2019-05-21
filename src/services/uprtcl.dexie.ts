import { Perspective, Commit, Context } from '../types';
import { UprtclService } from './uprtcl.service';
import Dexie from 'dexie';
import Buffer from 'buffer/';
import CID from 'cids';
import multihash from 'multihashes';

/**
 * @Guillem: Hola Leo, esto es solo una implementación de proof of concept que hice a partir 
 * de copiar y adaptar el codigo que tenias en database.js
 * No se si te servira para la implementación final, como veas :)
 */

export class UprtclDexie implements UprtclService {
  db: any;
  creatorId: string = 'myself';

  constructor() {
    this.db = new Dexie('collectiveone');
    this.db.version(0.1).stores({
      rootContext: 'id',
      context: 'id',
      perspective: 'id',
      commit: 'id'
    });
  }

  generateCid(object, idKey = 'id') {
    const objectWithoutId = {};
    for (const key of Object.keys(object)) {
      if (key !== idKey) {
        objectWithoutId[key] =  object[key];
      }
    }

    const b = Buffer.Buffer.from(JSON.stringify(objectWithoutId));
    var encoded = multihash.encode(b, 'sha2-256');
    var cid = new CID(1, 'dag-pb', encoded);
    return cid.toString();
  }

  getRootContext(): Promise<Context> {
    return Promise.reject();
  }

  getContextId(context: Context): Promise<string> {
    return this.generateCid(context);
  }

  getContext(contextId: string): Promise<Context> {
    return this.db.context.get(contextId);
  }

  getPerspective(perspectiveId: string): Promise<Perspective> {
    return this.db.perspective.get(perspectiveId);
  }

  getCommit(commitId: string): Promise<Commit> {
    return this.db.commit.get(commitId);
  }

  getContextPerspectives(contextId: string): Promise<Perspective[]> {
    return this.db.perspective.where('contextId').equals(contextId).toArray();
  }

  createContext(context: Context): Promise<string> {
    const id = this.generateCid(context);
    return this.db.context.add({ ...context, id: id }).then(() => id);
  }

  createPerspective(
    contextId: string,
    name: string,
    headLink: string
  ): Promise<string> {
    const perspective = {
      name: name,
      contextId: contextId,
      creatorId: this.creatorId
    };
    const id = this.generateCid(perspective);

    perspective['id'] = id;
    perspective['headLink'] = headLink;

    return this.db.perspective.add(perspective).then(() => id);
  }

  async createPerspectiveAndContent(
    context: Context,
    name: string,
    head: Commit
  ): Promise<string> {
    const contextId = await this.createContext(context);

    const commitId = this.generateCid(head);
    await this.db.commit.add({ ...head, id: commitId });

    return this.createPerspective(contextId, name, commitId);
  }

  async createCommit(
    perspectiveId: string,
    message: string,
    dataLink: string
  ): Promise<string> {
    const perspective = await this.getPerspective(perspectiveId);
    const parentsLinks = [perspective.headLink];

    const commit = {
      message: message,
      creatorId: this.creatorId,
      dataLink: dataLink,
      timestamp: Date.now(),
      parentsLinks: parentsLinks
    };

    const id = this.generateCid(commit);
    return this.db.commit.add(commit).then(() => id);
  }
}

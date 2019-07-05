import { BaseUprtclEntity } from './base.uprtcl.entity';
import { Perspective, Commit } from '../../types';


export class PerspectiveEntity extends BaseUprtclEntity<Perspective> {
  fork() {
    getCommit();
    commit.fork()
  }
}

export class CommitEntity extends BaseUprtclEntity<Commit> {
  fork() {
    const data = getData();
    data.fork()
  }
}


import { UprtclService } from '../uprtcl.service';
import {
  MockUprtcl,
  sampleCommit
} from './uprtcl.mock';
import findMostRecentCommonAncestor from './common.ancestor';

describe('Find Most Recent Common Ancestor tests', () => {
  let uprtcl: UprtclService;
  let commit: string;

  beforeEach(async () => {
    uprtcl = new MockUprtcl();

    commit = await uprtcl.createCommit(sampleCommit('data'));
  });

  it('Find most recent common ancestor of two commits', async () => {
    const commit1 = await uprtcl.createCommit(
      sampleCommit('data', [commit])
    );
    const commit2 = await uprtcl.createCommit(
      sampleCommit('data', [commit])
    );

    const ancestorCommit = await findMostRecentCommonAncestor(
      uprtcl
    )([commit1, commit2]);

    expect(ancestorCommit).toEqual(commit);
  });

  it('Find most recent common ancestor of 3 paths', async () => {
    // Path 1
    const commit1 = await uprtcl.createCommit(
      sampleCommit('data', [commit])
    );
    const commit2 = await uprtcl.createCommit(
      sampleCommit('data', [commit1])
    );
    const commit3 = await uprtcl.createCommit(
      sampleCommit('data', [commit2])
    );
    const commit4 = await uprtcl.createCommit(
      sampleCommit('data', [commit3])
    );

    // Path 2
    const commit5 = await uprtcl.createCommit(
      sampleCommit('data', [commit])
    );
    const commit6 = await uprtcl.createCommit(
      sampleCommit('data', [commit5])
    );
    const commit7 = await uprtcl.createCommit(
      sampleCommit('data', [commit6, commit2])
    );

    // Path 3
    const commit8 = await uprtcl.createCommit(
      sampleCommit('data', [commit6])
    );

    const ancestorCommit = await findMostRecentCommonAncestor(
      uprtcl
    )([commit4, commit7, commit8]);

    expect(ancestorCommit).toEqual(commit);
  });
});

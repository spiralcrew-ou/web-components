import { MockUprtcl, Node } from '../mocks/uprtcl.mock';
import { MockData } from '../mocks/data.mock';
import { RecursiveContextMergeStrategy } from '../../services/merge/recursive-context.merge.strategry';
import { UptrclTestUtils } from '../uprtcl.test.utils';

const initialDocument: Node = [
  'Document',
  [['Section1', [['Paragraph1', []], ['Paragraph2', []]]], ['Section2', []]]
];

describe('Merge service tests', () => {
  let uprtcl: MockUprtcl;
  let data: MockData;
  let utils: UptrclTestUtils;
  let merge: RecursiveContextMergeStrategy;
  let documentPerspectiveId: string;

  beforeEach(async () => {
    uprtcl = new MockUprtcl();
    data = new MockData();
    utils = new UptrclTestUtils(uprtcl, data);
    merge = new RecursiveContextMergeStrategy(uprtcl, data);

    documentPerspectiveId = await utils.buildNode(initialDocument);
  });

  it('Merge two nested branches', async () => {
    const perspectiveId = await utils.createGlobalPerspective(
      documentPerspectiveId,
      'proposal'
    );

    await utils.createGlobalCommit(documentPerspectiveId, [
      '1Document',
      [
        ['1Section1', [['1Paragraph1', []], ['1Paragraph2', []]]],
        ['1Section2', []]
      ]
    ]);

    await merge.mergePerspectives(documentPerspectiveId, [perspectiveId]);
    const mergeResult = await utils.getNode(documentPerspectiveId);
    expect(mergeResult).toEqual([
      '1proposal',
      [['1proposal', [['1proposal', []], ['1proposal', []]]], ['1proposal', []]]
    ]);
  });

  it('Merge two nested branches with order change', async () => {
    const perspectiveId = await utils.createGlobalPerspective(
      documentPerspectiveId,
      [
        'Document',
        [
          ['Section1', [['Paragraph1', []], ['Paragraph2', []]]],
          ['Section2', []]
        ]
      ]
    );

    const documentPerspectives = await utils.getPerspectivesNode(
      documentPerspectiveId
    );
    await utils.buryPerspective(
      documentPerspectiveId,
      documentPerspectives[1][0][0],
      'new parent'
    );

    const perspectives = await utils.getPerspectivesNode(perspectiveId);

    await utils.createCommitIn(perspectives[1][0][0], 'change');

    await merge.mergePerspectives(documentPerspectiveId, [perspectiveId]);
    const mergeResult = await utils.getNode(documentPerspectiveId);

    expect(mergeResult).toEqual([
      'Document',
      [
        ['new parent', [['change', [['Paragraph1', []], ['Paragraph2', []]]]]],
        ['Section2', []]
      ]
    ]);
  });
});

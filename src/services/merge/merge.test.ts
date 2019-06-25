import { UprtclService } from '../uprtcl.service';
import {
  MockUprtcl,
  sampleContext,
  samplePerspective,
  sampleCommit
} from './uprtcl.mock';
import { MergeService } from './merge.service';
import { TextNode } from '../../types';
import { DataService } from '../data.service';
import { MockData, sampleData } from './data.mock';

describe('Merge service tests', () => {
  let uprtcl: UprtclService;
  let data: DataService;
  let merge: MergeService;
  let contextId: string;
  let perspective: string;
  let commit: string;
  let dataId: string;

  beforeEach(async () => {
    uprtcl = new MockUprtcl();
    data = new MockData();
    merge = new MergeService(uprtcl, data);
    contextId = await uprtcl.createContext(sampleContext());
    perspective = await uprtcl.createPerspective(samplePerspective(contextId));

    dataId = await data.createData(sampleData('data'));

    commit = await uprtcl.createCommit(sampleCommit(dataId));
    await uprtcl.updateHead(perspective, commit);
  });

  it('Merge two pieces of content', async () => {
    const original = 'originalData';
    const newData = 'newData';

    const result1 = MergeService.mergeResult(original, [original, original]);
    expect(result1).toEqual(original);

    const result2 = MergeService.mergeResult(original, [original, newData]);
    expect(result2).toEqual(newData);
  });

  it('Merge two pieces of TextNode', async () => {
    let original: TextNode = {
      text: 'hi',
      links: [{ link: 'link1' }, { link: 'link2' }, { link: 'link3' }],
      type: 'paragraph'
    };
    let newData1: TextNode = {
      text: 'hi2',
      links: [{ link: 'link2' }, { link: 'link3' }, { link: 'link1' }],
      type: 'paragraph'
    };
    let newData2: TextNode = {
      text: '1hi',
      links: [{ link: 'link1' }, { link: 'link2' }, { link: 'link3' }],
      type: 'title'
    };

    // Check reordering links merge
    let result = MergeService.mergeData(original, [newData1, newData2]);
    let expectedResult: TextNode = {
      text: '1hi2',
      type: 'title',
      links: [{ link: 'link2' }, { link: 'link3' }, { link: 'link1' }]
    };
    expect(result).toEqual(expectedResult);

    // Check removing links merge
    newData1 = {
      text: 'hi2',
      links: [{ link: 'link2' }, { link: 'link1' }],
      type: 'paragraph'
    };
    result = MergeService.mergeData(original, [newData1, newData2]);
    expectedResult = {
      text: '1hi2',
      type: 'title',
      links: [{ link: 'link2' }, { link: 'link1' }]
    };
    expect(result).toEqual(expectedResult);

    // Check adding links merge
    newData1 = {
      text: 'hi2',
      links: [{ link: 'link2' }, { link: 'link1' }],
      type: 'paragraph'
    };
    newData2 = {
      text: 'hi',
      links: [
        { link: 'link1' },
        { link: 'link2' },
        { link: 'link3' },
        { link: 'link4' }
      ],
      type: 'title'
    };
    result = MergeService.mergeData(original, [newData1, newData2]);
    expectedResult = {
      text: 'hi2',
      type: 'title',
      links: [{ link: 'link2' }, { link: 'link1' }, { link: 'link4' }]
    };

    expect(result).toEqual(expectedResult);
  });

  it('Merge two strings', async () => {
    const str1 = 'some sentence that be merged carefully';
    const str2 =
      'first some long sentenca that should be merged carefully and something more';
    const str3 =
      'i mean some sentencb that anonimously be merged carefully and another else';

    let result = MergeService.mergeContent(str1, [str2, str3]);
    expect(result).toBe(
      'first i mean some long sentencab that should anonimously be merged carefully and something more and another else'
    );
  });

  it('Merge two branches', async () => {
    const perspective1 = await uprtcl.createPerspective(
      samplePerspective(contextId)
    );

    const data1 = await data.createData(sampleData('data and some more'));
    const data2 = await data.createData(sampleData('data or other things'));

    const commit2 = await uprtcl.createCommit(sampleCommit(data1, [commit]));
    const commit3 = await uprtcl.createCommit(sampleCommit(data2, [commit]));
    await uprtcl.updateHead(perspective, commit2);
    await uprtcl.updateHead(perspective1, commit3);

    const mergeCommitId = await merge.mergePerspectives(perspective, [
      perspective1
    ]);
    const mergeCommit = await uprtcl.getCommit(mergeCommitId);
    const mergedData = await data.getData(mergeCommit.dataId);
    expect(mergedData.text).toEqual('data and some more or other things');
  });
});

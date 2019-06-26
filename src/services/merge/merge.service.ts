import { TextNode } from '../../types';
import { Commit } from '../local/db.objects';
import { UprtclService } from '../uprtcl.service';
import { DataService } from '../data.service';
import { Diff, DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';

import * as lodash from 'lodash';
import findMostRecentCommonAncestor from './common.ancestor';

const diff = new DiffMatchPatch();

export class MergeService {
  uprtcl: UprtclService;
  data: DataService;

  constructor(uprtcl: UprtclService, data: DataService) {
    this.uprtcl = uprtcl;
    this.data = data;
  }

  async mergePerspectives(
    toPerspectiveId: string,
    fromPerspectivesIds: string[]
  ): Promise<string> {
    const commitsIds = [toPerspectiveId, ...fromPerspectivesIds].map(id =>
      this.uprtcl.getHead(id)
    );

    const headsIds = await Promise.all(commitsIds);

    const mergeCommitId = await this.mergeCommits(headsIds);

    await this.uprtcl.updateHead(toPerspectiveId, mergeCommitId);

    return mergeCommitId;
  }

  async mergeCommits(commitsIds: string[]): Promise<string> {
    const ancestorId = await findMostRecentCommonAncestor(this.uprtcl)(
      commitsIds
    );
    const ancestor = await this.uprtcl.getCommit(ancestorId);

    const originalData: TextNode = await this.data.getData(ancestor.dataId);
    const datasPromises = commitsIds.map(id =>
      this.uprtcl.getCommit(id).then(commit => this.data.getData(commit.dataId))
    );

    const newDatas: TextNode[] = await Promise.all(datasPromises);

    const newData = await MergeService.mergeData(originalData, newDatas);

    const newDataId = await this.data.createData(newData);

    const mergeCommit: Commit = {
      creatorId: 'anon',
      dataId: newDataId,
      parentsIds: commitsIds,
      message: 'merge commits',
      timestamp: Date.now()
    };

    return this.uprtcl.createCommit(mergeCommit);
  }

  static mergeLinks(
    originalLinks: string[],
    modificationsLinks: string[][]
  ): string[] {
    const allLinks = {};

    const originalLinksDic = {};
    for (let i = 0; i < originalLinks.length; i++) {
      const link = originalLinks[i];
      originalLinksDic[link] = {
        index: i,
        link: link
      };
    }

    const newLinks = [];
    for (let i = 0; i < modificationsLinks.length; i++) {
      const newData = modificationsLinks[i];
      const links = {};
      for (let j = 0; j < newData.length; j++) {
        const link = newData[j];
        links[link] = {
          index: j,
          link: link
        };
        allLinks[link] = true;
      }
      newLinks.push(links);
    }

    const resultLinks = [];
    for (const link of Object.keys(allLinks)) {
      const linkResult = this.mergeResult(
        originalLinksDic[link],
        newLinks.map(newLink => newLink[link])
      );
      if (linkResult) {
        resultLinks.push(linkResult);
      }
    }

    return resultLinks
      .sort((link1, link2) => link1.index - link2.index)
      .map(link => link.link);
  }

  static mergeData(originalData: TextNode, newDatas: TextNode[]): TextNode {
    const resultText = this.mergeContent(
      originalData.text,
      newDatas.map(data => data.text)
    );
    const resultType = this.mergeResult(
      originalData.type,
      newDatas.map(data => data.type)
    );

    const toLinks = (node: TextNode) => node.links.map(link => link.link);

    const mergedLinks = this.mergeLinks(
      toLinks(originalData),
      newDatas.map(data => toLinks(data))
    );

    return {
      links: mergedLinks.map(link => ({ link: link })),
      text: resultText,
      type: resultType
    };
  }

  static alignDiffs(diffs: Diff[][]): { original: Diff[]; news: Diff[][] } {
    const chars = {
      original: [],
      news: diffs.map(() => [])
    };

    while (!diffs.every(diff => diff.length === 0)) {
      const removalIndex = diffs.findIndex(
        diff => diff.length > 0 && diff[0][0] === DiffOp.Delete
      );
      if (
        removalIndex !== -1 &&
        diffs.every(
          (diff, index) =>
            removalIndex === index ||
            diff[0][0] === DiffOp.Equal ||
            (diff[0][0] === DiffOp.Delete &&
              diff[0][1] === diffs[removalIndex][0][1])
        )
      ) {
        // There has been a removal
        let original = diffs[removalIndex][0];
        diffs.forEach(diff => diff.shift());
        chars.original.push(original);
        chars.news.forEach(newChars => newChars.push(original));
      } else {
        const changeIndex = diffs.findIndex(
          diff => diff.length > 0 && diff[0][0] !== DiffOp.Equal
        );
        if (changeIndex !== -1) {
          const change = diffs[changeIndex].shift();
          chars.original.push(null);
          for (let i = 0; i < diffs.length; i++) {
            if (changeIndex === i) {
              chars.news[i].push(change);
            } else {
              chars.news[i].push(null);
            }
          }
        } else {
          let original = null;
          diffs.forEach(diff => (original = diff.shift()));
          chars.original.push(original);
          chars.news.forEach(newChars => newChars.push(original));
        }
      }
    }

    return chars;
  }

  static mergeContent(originalString: string, newStrings: string[]) {
    const diffs = newStrings.map(newString =>
      MergeService.char_diff(originalString, newString)
    );

    const alignedDiffs = this.alignDiffs(diffs);
    let mergeDiffs: Diff[] = [];
    for (let i = 0; i < alignedDiffs.original.length; i++) {
      const mergeDiff = this.mergeResult(
        alignedDiffs.original[i],
        alignedDiffs.news.map(newChar => newChar[i])
      );
      mergeDiffs.push(mergeDiff);
    }

    const patches = diff.patch_make(originalString, mergeDiffs, undefined);
    return diff.patch_apply(patches, originalString)[0];
  }

  static toChars(diffs: Diff[]): Diff[] {
    let result: Diff[] = [];
    for (const diff of diffs) {
      const charDiff = diff[1].split('').map(word => <Diff>[diff[0], word]);
      result = result.concat(charDiff);
    }
    return result;
  }

  static char_diff(str1: string, str2: string): Diff[] {
    const diffs = diff.diff_main(str1, str2);
    return this.toChars(diffs);
  }

  static mergeResult<T>(original: T, modifications: Array<T>): T {
    const changes = modifications.filter(
      modification => !lodash.isEqual(original, modification)
    );

    switch (changes.length) {
      // Object has not changed
      case 0:
        return original;
      case 1:
        return changes[0];
      default:
        if (changes.every(change => lodash.isEqual(changes[0], change))) {
          return changes[0];
        }
        throw new Error('conflict when trying to merge');
    }
  }
}

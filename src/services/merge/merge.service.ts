import { TextNode } from '../../types';
import { Commit } from '../local/db.objects';
import { UprtclService } from '../uprtcl.service';
import { DataService } from '../data.service';
// import { DiffMatchPatch } from 'diff-match-patch-ts';

import * as _ from 'lodash';
import findMostRecentCommonAncestor from './common.ancestor';
export class MergeService {
  static mergePerspectives(
    uprtcl: UprtclService,
    data: DataService
  ): (
    toPerspectiveId: string,
    fromPerspectivesIds: string[]
  ) => Promise<string> {
    return async (toPerspectiveId: string, fromPerspectivesIds: string[]) => {
      const commitsIds = [toPerspectiveId, ...fromPerspectivesIds].map(id =>
        uprtcl.getHead(id)
      );

      const headsIds = await Promise.all(commitsIds);

      const mergeCommitId = await this.mergeCommits(uprtcl, data)(headsIds);

      await uprtcl.updateHead(toPerspectiveId, mergeCommitId);

      return mergeCommitId;
    };
  }

  static mergeCommits(
    uprtcl: UprtclService,
    data: DataService
  ): (commitsIds: string[]) => Promise<string> {
    return async (commitsIds: string[]) => {
      const ancestorId = await findMostRecentCommonAncestor(uprtcl)(commitsIds);
      const ancestor = await uprtcl.getCommit(ancestorId);

      const originalData: TextNode = await data.getData(ancestor.dataId);
      const datasPromises = commitsIds.map(id =>
        uprtcl.getCommit(id).then(commit => data.getData(commit.dataId))
      );

      const newDatas: TextNode[] = await Promise.all(datasPromises);

      const newData = await this.mergeData(originalData, newDatas);

      const newDataId = await data.createData(newData);

      const mergeCommit: Commit = {
        creatorId: 'anon',
        dataId: newDataId,
        parentsIds: commitsIds,
        message: 'merge commits',
        timestamp: Date.now()
      };

      return uprtcl.createCommit(mergeCommit);
    };
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
    const resultText = this.mergeResult(
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
/* 
  static mergeContent(str1: string, str2: string) {
    const diff = new DiffMatchPatch();
    diff.
    return diff.diff_main(str1, str2);
  } */

  static mergeResult<T>(original: T, modifications: Array<T>): T {
    const changes = modifications.filter(
      modification => !_.isEqual(original, modification)
    );

    switch (changes.length) {
      // Object has not changed
      case 0:
        return original;
      case 1:
        return changes[0];
      default:
        if (changes.every(change => _.isEqual(changes[0], change))) {
          return changes[0];
        }
        throw new Error('conflict when trying to merge');
    }
  }
}

export interface MergeStrategy<T> {
  /**
   * @returns the id of the resulting head commit of the perspective to merge to
   */
  mergePerspectives(
    toPerspectiveId: string,
    fromPerspectivesIds: string[]
  ): Promise<string>;

  /**
   * @returns the id of the resulting merge commit
   */
  mergeCommits(commitsIds: string[]): Promise<string>;

  mergeData(originalData: T, newDatas: T[]): Promise<T>;

  mergeContent(originalString: string, newStrings: string[]): Promise<string>;

  mergeLinks(originalLinks: string[], modificationsLinks: string[][]): Promise<string[]>;

  /**
   *
   * @param original
   * @param modifications
   * @returns the appropiate result of the merge
   */
  mergeResult<A>(original: A, modifications: Array<A>): A;
}

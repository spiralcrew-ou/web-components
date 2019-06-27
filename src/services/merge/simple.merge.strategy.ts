import { TextNode } from '../../types';
import { BaseMergeStrategy } from './base.merge.strategy';

export class SimpleMergeStrategy extends BaseMergeStrategy<TextNode> {
  async mergeData(
    originalData: TextNode,
    newDatas: TextNode[]
  ): Promise<TextNode> {
    const resultText = await this.mergeContent(
      originalData.text,
      newDatas.map(data => data.text)
    );
    const resultType = this.mergeResult(
      originalData.type,
      newDatas.map(data => data.type)
    );

    const toLinks = (node: TextNode) => node.links.map(link => link.link);

    const mergedLinks = await this.mergeLinks(
      toLinks(originalData),
      newDatas.map(data => toLinks(data))
    );

    return {
      links: mergedLinks.map(link => ({ link: link })),
      text: resultText,
      type: resultType
    };
  }
}

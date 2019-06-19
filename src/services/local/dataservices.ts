import { TextNode, KnownSources } from '../../objects';
import { TextNode as ITextNode } from '../../types';

import Dexie from 'dexie';

class LocalDatabase extends Dexie {
  drafts: Dexie.Table<TextNode, string>;
  textNode: Dexie.Table<TextNode, string>;
  knowSources: Dexie.Table<KnownSources, string>;

  constructor() {
    super('CollectiveOne');
    this.version(0.1).stores({
      drafts: '',
      knowSources: 'hash',
      textNode: 'id'
    });
    this.drafts.mapToClass(TextNode);
    this.knowSources.mapToClass(KnownSources);
    this.textNode.mapToClass(TextNode);
  }
}

export const db = new LocalDatabase();

window['db'] = db;

export const insertDraft = (objectId: string, draft: ITextNode): Promise<any> => {
  const node = new TextNode(draft.text, draft.type, draft.links)
  return db.drafts.put(node, objectId);
};

export const getDraft = (id: string): Promise<any> => {
  return db.drafts.get(id);
};

export const getKnownSources = (hash: string): Promise<string[]> => {
  return db.knowSources.get(hash).then(result => {
    if (!result) return [];
    else return result.sources;
  });
};

export const insertKnownSources = (
  knownSources: KnownSources
): Promise<any> => {
  return db.knowSources.put(knownSources);
};

export const insertTextNode = async (object: TextNode): Promise<any> => {
  return db.textNode.put(object);
};

export const getTextNode = (id: string): Promise<TextNode> => {
  return db.textNode.get(id);
};

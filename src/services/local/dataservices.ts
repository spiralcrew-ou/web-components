import { Draft, TextNode, KnownSources } from '../../objects';

import Dexie from 'dexie';

class LocalDatabase extends Dexie {
  drafts: Dexie.Table<Draft, string>;
  textNode: Dexie.Table<TextNode, string>;
  knowSources: Dexie.Table<KnownSources, string>;

  constructor() {
    super('CollectiveOne');
    this.version(0.1).stores({
      drafts: 'id',
      knowSources: 'hash',
      textNode: 'id'
    });
    this.drafts.mapToClass(Draft);
    this.knowSources.mapToClass(KnownSources);
    this.textNode.mapToClass(TextNode);
  }
}

export const db = new LocalDatabase();

window['db'] = db;

export const insertDraft = (draft: Draft): Promise<any> => {
  return db.drafts.put(draft);
};

export const getDraft = (id: string): Promise<any> => {
  return db.drafts.get(id);
};

export const modifyDraft = (draft: Draft): void => {
  db.drafts
    .where('id')
    .equals(draft.id)
    .modify(draft);
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

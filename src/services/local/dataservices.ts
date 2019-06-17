import {
  Perspective as IPerspective,
  Commit as ICommit
} from '../../types';

import {Perspective, Commit, Context, Draft, TextNode, KnownSources} from '../../objects';

import Dexie from 'dexie';

class LocalDatabase extends Dexie {
  perspectives: Dexie.Table<Perspective, string>
  commits: Dexie.Table<Commit, string>
  contexts: Dexie.Table<Context, string>
  drafts: Dexie.Table<Draft, string>
  textNode: Dexie.Table<TextNode, string>
  knowSources: Dexie.Table<KnownSources, string>

  constructor() {
    super('CollectiveOne');
    this.version(0.1).stores({
      perspectives: 'id,contextId',
      commits: 'id',
      contexts: 'id',
      drafts: 'id',
      knowSources: 'hash',
      textNode: 'id'
    })
    this.contexts.mapToClass(Context)
    this.perspectives.mapToClass(Perspective)
    this.commits.mapToClass(Commit)
    this.drafts.mapToClass(Draft)
    this.knowSources.mapToClass(KnownSources)
    this.textNode.mapToClass(TextNode)
  }
}

const db = new LocalDatabase()

window['db'] = db

export const fetchPerspective = (_id: string) => {
  return db.perspectives.where('id').equals(_id)
}

export const insertPerspective = (perspective): Promise<any> => {
  return db.perspectives.put(perspective)
}

export const updatePerspectiveHead = (perspectiveId, commitId): Promise<any> => {
  return db.perspectives.where('id').equals(perspectiveId).modify({ headId: commitId })
}

export const insertContext = (context): Promise<any> => {
  return db.contexts.put(context)
}

export const insertCommit = (commit): Promise<any> => {
  return db.commits.put(commit)
}

export const getContext = (contextId): Promise<any> => {
  return db.contexts.get(contextId)
}

export const getPerpectives = (contextId): Promise<any> => {
  return db.perspectives.where('contextId').equals(contextId).toArray()
}

export const getPerspective = (perspectiveId: string): Promise<IPerspective> => {
  return db.perspectives.get(perspectiveId)
}

export const getCommit = (commitId: string): Promise<ICommit> => {
  return db.commits.get(commitId)
}

export const insertDraft = (draft: Draft): Promise<any> => {
  return db.drafts.put(draft)
}

export const getDraft = (id: string): Promise<any> => {
  return db.drafts.get(id)
}

export const modifyDraft = (draft: Draft): void => {
  db.drafts.where('id').equals(draft.id).modify(draft)
}

export const getKnownSources = (hash: string): Promise<string[]> => {
  return db.knowSources.get(hash).then(result => {
    if (!result)
      return []
    else
      return result.sources
  })
}

export const insertKnownSources = (knownSources: KnownSources): Promise<any> => {
  return db.knowSources.put(knownSources)
}

export const insertTextNode = async (object: TextNode): Promise<any> => {
  return db.textNode.put(object)
}

export const getTextNode = (id: string): Promise<TextNode> => {
  return db.textNode.get(id)
}

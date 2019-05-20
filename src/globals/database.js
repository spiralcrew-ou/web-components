import Dexie from 'dexie';
import { generateDataId, generateCommitId, generateCID } from '../main_functions';
import {now} from '../globals/utils';

const db = new Dexie("collectiveone");

db.version(0.1).stores({
  context: 'id',
  perspective: 'id',
  commit: 'id',
  content: 'id',
  documentStore: 'id',
  currentDocument: 'id'
});



export const createEmptyContext = async(creatorId,name,contentData) => {
  
  const context  =  await createContext(creatorId)
  const content = await createContent(contentData ? contentData : {type:'co-paragraph',content: ''})
  const commit = await createCommit(creatorId,[],'Initial commit',content)
  const perspective = await createPerspective(creatorId,name,context,commit)
  return {
    context,
    perspective
  }
}



export const createContext = (creatorId) => {
  const id = generateCID(creatorId)
  const data = {
    id,
    creator: creatorId,
    timestamp: new Date().getTime(),
    perspectives: []
  }
  db.context.add(data)

  return data 
}

export const createPerspective = async(creatorId, name, context, commit) => {

  const id = generateCID(creatorId)
  const data = {
    id,
    name,
    context: context.id,
    head: commit.id,
    headObject: commit
  }
  db.perspective.add(data).then(() => {return data})
  return data 
}

export const newPerspective = async(currentPerspective) => {
  console.log(currentPerspective)
}

export const createCommit = (creatorId, parentsCommitsId, message,content) => {
  const id = generateCommitId(creatorId, parentsCommitsId, message, content)
  const data = {
    id,
    message,
    creator: creatorId,
    timestamp: new Date().getTime(),
    parents: parentsCommitsId,
    content: content.id,
    contentObject: content
  }
  db.commit.add(data).then( () => {return data})
  return data
}


export const createContent = content => {
  const id = generateDataId()
  db.content.add({ id, content })
  return { id, content }
  
}

export const getContentByContentId = async id => {
  return db.content.get(id)
}

export async function getContentByCommitId(id) {
  return await db.content.get((await db.commit.get(id)).content)
}

export const updateContent = (contentId, data) =>  { 
  db.content.where('id').equals(contentId).modify({content:data}) 
}




export const documentHandler =  {
  newDocument : async (context, perspective) => {
    const id = context.id + perspective.id
    db.documentStore.add({id,context,perspective})
    db.currentDocument.add({id,context,perspective,lastAccess: now()})
  },
  getCurrentDocument: async() => {
    return db.currentDocument.toCollection()
  },
  updateCurrentDocument: (context,perspective) => {
    const id = context.id + perspective.id
    db.currentDocument.where("id").equals(id).modify({context,perspective})
  }
}
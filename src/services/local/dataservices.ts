// Only data access module
import {
    Perspective as IPerspective,
    Commit as ICommit,
    Context as IContext
} from '../../types';

import Dexie from 'dexie';

export class Perspective implements IPerspective {
    id: string;
    origin: string;
    creatorId: string;
    timestamp: number;
    contextId: string;
    name: string;
    headId: string;
    constructor(_id, _origin,_creatorId, _timestamp,_contextId,_name,_headId){
        this.id = _id
        this.origin = _origin
        this.creatorId = _creatorId
        this.timestamp = _timestamp
        this.contextId = _contextId
        this.name = _name
        this.headId = _headId
    }
}

export class Commit implements ICommit {
    id?: string;    creatorId: string;
    timestamp: number;
    message: string;
    parentsIds: string[];
    dataId: string;
    constructor(_id,_timestamp,_message,_parentsId,_dataId) {
        this.id = _id
        this.timestamp = _timestamp
        this.message = _message
        this.parentsIds = _parentsId
        this.dataId = _dataId
    }
}

export class Context implements IContext {
    id?: string;    
    creatorId: string;
    timestamp: number;
    nonce: number;
    constructor(_id,_creatorId,_timestamp,_nonce) {
        this.id = _id
        this.creatorId = _creatorId
        this.timestamp = _timestamp
        this.nonce = _nonce
    }
}

class LocalDatabase extends Dexie {
    perspectives: Dexie.Table<Perspective,string>
    commits: Dexie.Table<Commit, string>
    contexts: Dexie.Table<Context,string>

    constructor() {
        super('CollectiveOne');
        this.version(0.1).stores({
            perspectives: 'id,contextId',
            commits: 'id',
            contexts: 'id'
        })
        // this.perspectives = this.table('perspectives')
        // this.contexts = this.table('contexts')
        // this.commits = this.table('commits')
        this.contexts.mapToClass(Context)
        this.perspectives.mapToClass(Perspective)
        this.commits.mapToClass(Commit)
    }
}

const db = new LocalDatabase()

export const fetchPerspective = (_id:string)=> {
    return db.perspectives.where('id').equals(_id) 
} 

export const insertPerspective = (perspective): Promise<any> => {
    return db.perspectives.add(perspective)
}

export const insertContext = (context): Promise<any> => {
    return db.contexts.add(context)
}

export const insertCommit = (commit): Promise<any> => { 
    return db.commits.add(commit)
}

export const getContext = (contextId):Promise<any> => {
    return db.contexts.get(contextId)
}

export const getPerpectives = (contextId):Promise<any> => {
    return db.perspectives.where('contextId').equals(contextId).toArray()
}
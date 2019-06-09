import CID from 'cids';
import multihash from 'multihashes';
import Buffer from 'buffer/';
import Hashids from 'hashids';


export const generateCID = creatorId => {
    
    const body = {
        '@creatorid': creatorId,
        "@timestamp": new Date().getTime().toString()
    }
    const b = Buffer.Buffer.from(JSON.stringify(body))
    var encoded = multihash.encode(b, 'sha2-256')
    var cid = new CID(1, 'dag-pb', encoded)
    return cid.toString()
}


export const generateUserContextId = (userID)  => {
    const body = {
        '@creatorid': userID,
        "@timestamp": 0
    }
    const b = Buffer.Buffer.from(JSON.stringify(body))
    var encoded = multihash.encode(b, 'sha2-256')
    var cid = new CID(1, 'dag-pb', encoded)
    return cid.toString()
}

export const generateCommitId = (creatorId, parentsCommitsId, message,content) => {

    const body = {
        '@creatorid': creatorId,
        partentCommits : parentsCommitsId,
        message,
        contentId: content
    }

    const b = Buffer.Buffer.from(JSON.stringify(body))
    var encoded = multihash.encode(b, 'sha2-256')
    var cid = new CID(1, 'dag-pb', encoded)
    return cid.toString()
}

export const generateDataId = () => {
    var hashids = new Hashids();
    return hashids.encode(new Date().getTime().toString())
}




export const createEmptyContext = creatorId => {

    const contextId = generateCID(creatorId)
    const commit = generateCommitId(creatorId,[],'first commit')
    const dataId = generateDataId()
    const body = {}

    body[contextId] = {}
    body[contextId]['root'] = {
        id: '',
        contextId,
        view: '',
        name: 'default',
        head: commit,
        creator: creatorId
    }

    body[contextId]['commits'] = {}
    body[contextId]['commits']['commit'] = {} 
    
    body[contextId]['commits']['commit'][commit] = {}

    body[contextId]['commits']['commit'][commit] = {
        id: commit,
        type: 'co-paragraph',
        content: {
            data: dataId
        }
    }

    body[contextId]['data'] ={} 
    body[contextId]['data'][dataId] = {}

    body[contextId]['data'][dataId] = {
        content: ''
    }

    return body

}

export const createCommit = (creatorId,contextElement) => {
    const contextId = Object.keys(contextElement)[0]
    const commit = generateCommitId(creatorId,Object.keys(contextElement[contextId]['commits']['commit']),'Another commit')
    const head = contextElement[contextId].root.head
    const oldDataId = contextElement[contextId].commits.commit[head].content.data
    const content = contextElement[contextId].data[oldDataId].content
    const dataId = generateDataId()
    const type = contextElement[contextId].commits.commit[head].type

    contextElement[contextId]['root']['head']=commit
    contextElement[contextId]['commits']['commit'][commit] ={
        id: commit,
        type,
        content: {
            data: dataId
        }
    }
    //context[contextId]['data']={}
    contextElement[contextId]['data'][dataId] = {
        content
    }

    return contextElement


}
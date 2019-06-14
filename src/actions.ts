import Hashids from 'hashids'

const getRandomId = ()  => {
    const id = new Hashids(new Date().getTime().toString())
    return id.encode(1, 2, 3)
  }

export const saveDraft = (_block) => {
    // Update draft in tree and service
}
/*

blocksTree id -> {
    id: "id"
    parent: "parent id"
    children: [],
    block: {
        content: 
        status: DRAFT
    }
}

const readBlockRec = (perspective, getState.tree) => {
    block {
        parent: ""
        children: perspective.head.data.links.map( link => {
            { 
                link: link.link,
                style: switch (link.type) 
                    case 'leaf': 'paragraph' break; 
                    case 'node': 'title' break;
        },         
        block: {
            content:  persecoive.head.data.text
            status: hasChanges(persecoive)
        }
    }

    getState.tree[perspective.id] = block
    
    perspective.head.data.links.links.map(p => readBlockRec(p.id));
}

export const reloadTree = () =>  {
    return (dispatch, getState) => {
        perspectiveFull = await this.uprtcData.getPerspectiveFull(getState.rootId, -1);

        dispatch readBlockRec(perspectiveFull, getState.tree)
    }
}
*/

export const newBlock = (block, parentId) =>  {
    return (dispatch, getState) => {
        
        /*
        Documento 
            Parrafo
            Titulo 1 (Documento)
                Parrafo
                Parrafo
                parrafo
            Titulo 2 ()
                Parrafo
        */

        block = getRandomId() // Replace with Perspective    upcrtldata.initContext(parentId, block.content )
        const tree =  getState().workpad.tree
        const parentIdx = tree.findIndex(e => e.id===parentId)
    
        // Last Element only push
        if ((!parentId)  || (parentIdx === tree.length -1 ))
            tree.push(block)
        else {
            tree.splice(parentIdx+1,0,block) 
        }
        dispatch({ type: 'NEW_BLOCK', block, tree})

        /*--------

        return (dispatch, getState) => {
        
            // perspective tree in indexedDB 
            // blocks tree in redux as flat map
    
            const initNode = blocks[initiatorId];
    
            switch (initNode.block.style) {
                case 'title':
                    this.uprtcData.initContextUnder(
                        initNode.serviceProvider,
                        initNode.id,
                        0,
                        block.content)
                break;
    
                case 'paragraph':
                    parentnode = blocks[initNode.parentPerspectiveID]
                    index = parentnode.children.indexOf(initiatorId)
                    newId = this.uprtcData.initContextUnder(
                        parentnode.serviceProvider,
                        parentnode.id,
                        index + 1,
                        block.content)
                    
                    // perspective tree to block tree synchronization 
                    // Optimistic fast approach 
                    // parentnode.children.splice(index + 1, newId)
                    
                break;
            }
    
            // perspective tree to block tree synchronization 
            // Brute Force
            blocks = dispatch('reloadTree')
        }*/
    }
}


/*
setView = (blockId, newView) =>  {
    
    blockId.view = newView

    changing the type of a paragraph to a title will move all the next sibling contexts of the paragraph as subcontexts of the new title.

    Changing the type of a title to a paragraph will move all its subcontexts as next-siblings of the new typed paragraph

    uprtclData.createSibling.then(
        this.list = flat again
    )

}

deleteBlock (blockId) {
    Changing the type of a paragraph to a title will move all the next sibling contexts of the paragraph as subcontexts of the new title.
    Changing the type of a title to a paragraph will move all its subcontexts as next-siblings of the new typed paragraph
}*/

export const commitAll = () => {

    // Update Tree, transform DRAFT to COMMITED
    // Send only status=DRAFT 
    return dispatch => {
        dispatch({ type: 'COMMIT ALL'})
    }
}

export const updateTree = (tree:[]) => {
    return dispatch => {
        dispatch({ type: 'UPDATE TREE', tree})
    }
}
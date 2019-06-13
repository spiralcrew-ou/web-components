import Hashids from 'hashids'

const getRandomId = ()  => {
    const id = new Hashids(new Date().getTime().toString())
    return id.encode(1, 2, 3)
  }

export const saveDraft = (_block) => {
    // Update draft in tree and service
}

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
import { uprtclData } from "./services/uprtcl-data";

export const newBlock = (block, parentId) =>  {
    
    return (dispatch, getState) => {
        const parent = list.find(e => e.id===parentId)

        uprtclData.createSibling.then(
            this.list = flat again
        )
        
        // Last Element only push
        if ((!parentId)  || (parentIdx === tree.length -1 ))
            tree.push(block)
        else {
            tree.splice(parentIdx+1,0,block) 
        }
        dispatch({ type: 'NEW_BLOCK', block, tree})
    }
}

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
}

export const updateTree = (tree:[]) => {
    return dispatch => {
        dispatch({ type: 'UPDATE TREE', tree})
    }
}

export const newBlock = (block,tree, parentId) =>  {
    
    const parentIdx = tree.findIndex(e => e.id===parentId)
    // Last Element only push
    if ((!parentId)  || (parentIdx === tree.length -1 ))
        tree.push(block)
    else {
        tree.splice(parentIdx+1,0,block) 
    }

    return dispatch => {
        dispatch({ type: 'NEW_BLOCK', block, tree})
    }
}

export const updateTree = (tree:[]) => {
    return dispatch => {
        dispatch({ type: 'UPDATE TREE', tree})
    }
}
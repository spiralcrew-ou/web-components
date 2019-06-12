
export const newBlock = (block,tree) =>  {
    tree.push(block)
    return dispatch => {
        dispatch({ type: 'NEW_BLOCK', block, tree})
    }
}

export const updateTree = (tree:[]) => {
    return dispatch => {
        dispatch({ type: 'UPDATE TREE', tree})
    }
}
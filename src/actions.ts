import Hashids from 'hashids'
import { UprtclData } from './services/uprtcl-data';
import { PerspectiveFull } from './types';

const uprtcData = new UprtclData()

const getRandomId = () => {
  const id = new Hashids(new Date().getTime().toString())
  return id.encode(1, 2, 3)
}

/**
 * 
 * @param _block WIP 
 */
export const saveDraft = (_block) => {
  return dispatch => {
    dispatch({type:'SAVE DRAFT'})
  }
}

/** This method create initial context 
 * 
 * @param rootId 
 */
export const initWorkPad = (rootId) => {
  return dispatch => {
    dispatch({ type: 'INIT WORKPAD', rootId, tree: {} })
  }
}

const hasChanges = (_perspective: PerspectiveFull): boolean => {
  return _perspective.head ? false : true
}

const getTypeOfComponent = (type: string): string => {
  switch (type) {
    case 'leaf': return 'paragraph'
    case 'node': return 'title'
    default: return 'paragraph'
  }
}

const readBlockRec = (perspective, tree) => {
  if (perspective.draft.links.length != 0) {
    perspective.draft.links.map(p => readBlockRec(p.link, tree))
    return tree
  }


  const dataFromDraftOrCommits = perspective.head ? perspective.head.data.links : perspective.draft.links
  const block = {
    parent: '',
    id: perspective.id,
    children: dataFromDraftOrCommits.map(link => (
      {
        link: link.link,
        style: getTypeOfComponent(link.type)
      })),
    status: hasChanges(perspective) ? 'DRAFT' : 'COMMITED',
    content: perspective.head ? perspective.head.data.text : perspective.draft.text
  }
  tree[perspective.id] = block
  return block
}


export const reloadTree = () => {
  return async (dispatch, getState) => {
    const perspectiveFull = await uprtcData.getPerspectiveFull(getState().workpad.rootId, -1);
    const t = getState().workpad.tree
    readBlockRec(perspectiveFull, t)
    dispatch({ type: 'RELOAD TREE', tree: readBlockRec(perspectiveFull, t) })
  }
}

/** This method (WIP) create a new draft for a perspective. This method force to reload 
 * 
 * @param block 
 * 
 */
export const newDraft = block => {
  return (dispatch) => {
    dispatch({type: 'NEW DRAFT', block})
  }
}

export const newBlock = (block, parentId) => {
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
    const tree = getState().workpad.tree
    const parentIdx = tree.findIndex(e => e.id === parentId)

    // Last Element only push
    if ((!parentId) || (parentIdx === tree.length - 1))
      tree.push(block)
    else {
      tree.splice(parentIdx + 1, 0, block)
    }
    dispatch({ type: 'NEW_BLOCK', block, tree })

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
                parentnode.children.splice(index + 1, newId)
                
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



/**
 * 
 * This method remove a block (perspective indeed) from tree. 
 * @param {*} block 
 * @returns dispatch a reloadTree event
 */
export const removeBlock = block => {
  /** TODO: This version only remove block from tree. This method will be improved doing: 
   * Remove perspective  (service and re-index all perspective and context)
   * Call a reload dispatch event to force render component. 
   * TO CHECK With Pepo. 
   */
  return (dispatch,getState) => {
    const tree = Object.assign({},getState().workpad.tree)
    delete tree[block.id]
    dispatch({type: 'REMOVE BLOCK', tree })
  }
}


/** 
 * WIP
 */
export const commitAll = () => {

  // Update Tree, transform DRAFT to COMMITED
  // Send only status=DRAFT 
  return (dispatch) => {
    dispatch({ type: 'COMMIT ALL' })
  }
}

export const updateTree = (tree: []) => {
  return dispatch => {
    dispatch({ type: 'UPDATE TREE', tree })
  }
}
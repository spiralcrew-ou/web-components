import { UprtclData } from "./services/uprtcl-data";
import { PerspectiveFull, TextNodeFull } from "./types";

const uprtcData = new UprtclData();

/**
 *
 * @param _block WIP
 */
export const saveDraft = _block => {
  return dispatch => {
    dispatch({ type: "SAVE DRAFT" });
  };
};


/** This method create initial context 
 * 
 * @param rootId 
 */
export const initWorkPad = rootId => {
  return dispatch => {
    dispatch({ type: "INIT WORKPAD", rootId, tree: {} });
  };
};

const hasChanges = (_perspective: PerspectiveFull): boolean => {
  return _perspective.head ? false : true;
};

const getPerspectiveData = (perspective: PerspectiveFull): TextNodeFull => {
  if (hasChanges(perspective)) {
    return perspective.draft;
  } else {
    return perspective.head.data;
  }
};

const readBlockRec = (
  perspectiveFull: PerspectiveFull,
  tree,
  parentId: string
): void => {
  let data = getPerspectiveData(perspectiveFull);

  const block = {
    id: perspectiveFull.id,
    children: [],
    status: hasChanges(perspectiveFull) ? "DRAFT" : "COMMITED",
    content: data.text,
    style: "paragraph",
    parentPerspectiveID: parentId,
    serviceProvider: perspectiveFull.origin
  };

  data.links.map(link => {
    readBlockRec(link.link, tree, parentId);
    block.children.push(link.link.id);
  });

  tree[perspectiveFull.id] = block;

  return;
};

export const reloadTree = () => {
  return async (dispatch, getState) => {
    const perspectiveFull = await uprtcData.getPerspectiveFull(
      getState().workpad.rootId,
      -1
    );
    const t = getState().workpad.tree;
    dispatch({
      type: "RELOAD TREE",
      tree: readBlockRec(perspectiveFull, t, getState().workpad.rootId)
    });
  };
};

/** This method (WIP) create a new draft for a perspective. This method force to reload
 *
 * @param block
 *
 */
export const newDraft = block => {
  return dispatch => {
    dispatch({ type: "NEW DRAFT", block });
  };
};

export const newBlock = (block, initiatorId) => {
  return async (dispatch, getState) => {
    const tree = getState().workpad.tree;
    const initNode = tree[initiatorId];

    switch (initNode.style) {
      case "title":
        this.uprtcData.initContextUnder(
          initNode.serviceProvider,
          initNode.id,
          0,
          block.content
        );
        break;

      default:
        const parentnode = tree[initNode.parentPerspectiveID];
        const index = tree[initNode.parentPerspectiveID].children.findIndex(pId => pId === initiatorId)
        const newId = await uprtcData.initContextUnder(
          parentnode.serviceProvider,
          parentnode.id,
          index + 1,
          block.content
        );
        const newTree = Object.assign({}, tree);
        newTree[newId] = {
          id: newId,
          children:[],
          status: 'DRAFT',
          content:'',
          style: 'paragraph',
          parentPerspectiveID:initNode.parentPerspectiveID,
          serviceProvider: parentnode.serviceProvider
        }
        newTree[initNode.parentPerspectiveID].children.splice(index+1, 0, newId);
        dispatch({ type: "NEW BLOCK", tree: newTree });
        break;
    }
  };
};

export const setView = (block,newView) => {
  //TODO: Change view from perspective and re-calculate node if apply
  return (dispatch,getState) => {
    const tree = Object.assign({},getState().workpad.tree)
    tree[block.id].style=newView
    dispatch({type:'SET VIEW', tree})
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

/**
 *
 * This method remove a block (perspective indeed) from tree.
 * @param {*} block
 * @returns dispatch a reloadTree event
 */
export const removeBlock = block => {
  return (dispatch, getState) => {
    uprtcData.removePerspective(block.serviceProvider,block.parentPerspectiveID,block.id)
    const tree = Object.assign({}, getState().workpad.tree);
    delete tree[block.id];
    tree[block.parentPerspectiveID].children= tree[block.parentPerspectiveID].children.filter(id => id!= block.id)
    dispatch({ type: "REMOVE BLOCK", tree });
  };
};

/**
 * WIP
 */
export const commitAll = () => {
  // Update Tree, transform DRAFT to COMMITED
  // Send only status=DRAFT

  return (dispatch,getState) => {
    const tree = getState().workpad.tree

    const toCommit = Object.keys(tree).
                        map(k => tree[k]).
                        filter(block => block.contentUser)
    
    console.log(toCommit)
    dispatch({ type: "COMMIT ALL" });
  };
};

/**This function update content data from user (only for UI)
 * 
 * @param block The block was updated
 * @param newContent  new Content input from user (UI)
 */
export const updateContentFromUser = (block, newContent) => {
  return (dispatch,getState) => {
    const tree = getState().workpad.tree
    tree[block.id].contentUser = newContent
    dispatch({type: 'UPDATE CONTENT FROM USER', tree})
  }
}

/**
 * This function open the contextual menu
 */
export const openMenu = (blockId) => {
  return (dispatch) => {
    dispatch({type: 'OPEN MENU', isClose:false,blockId})
  }
}

/**
 * This function close the contextual menu
 */
export const closeMenu = () => {
  return (dispatch) => {
    dispatch({type: 'OPEN MENU', isClose:true})
  }

}
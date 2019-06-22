import { UprtclData } from "./services/uprtcl-data";
import { PerspectiveFull, TextNodeFull, TextNode } from "./types";

const uprtclData = new UprtclData();

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

const getMasterTree = async(getState) =>  { 
  return await uprtclData.getPerspectiveFull(
    getState().workpad.rootId,
    -1
  );
}

export const reloadTree = () => {
  return async (dispatch, getState) => {
    const perspectiveFull = await getMasterTree(getState)
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
        this.uprtclData.initContextUnder(
          initNode.serviceProvider,
          initNode.id,
          0,
          block.content
        );
        break;

      default:
        const parentnode = tree[initNode.parentPerspectiveID];
        const index = tree[initNode.parentPerspectiveID].children.findIndex(pId => pId === initiatorId)

        await uprtclData.initContextUnder(
          parentnode.serviceProvider,
          parentnode.id,
          index + 1,
          ''
        );
        const perspectiveFull =  await getMasterTree(getState) 
        const newTree =Object.assign({},readBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId))
        dispatch({ type: "NEW BLOCK", tree:newTree});
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


/**
 *
 * This method remove a block (perspective indeed) from tree.
 * @param {*} block
 * @returns dispatch a reloadTree event
 */
export const removeBlock = block => {
  return async(dispatch, getState) => {
    await uprtclData.removePerspective(block.serviceProvider,block.parentPerspectiveID,block.id)
    const perspectiveFull =  await getMasterTree(getState) 
    dispatch({ type: "REMOVE BLOCK", tree: readBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
  };
};

/**
 * WIP
 */
export const commitAll = (serviceProvider) => {
  return async (dispatch,getState) => {
    /*
    const tree = getState().workpad.tree
    const toCommit = Object.keys(tree).
                        map(k => tree[k]).
                        filter(block => block.contentUser)*/

    const rootDocument = getState().workpad.tree[getState().workpad.rootId]
    
    await uprtclData.commitGlobal(
      rootDocument.serviceProvider,
      serviceProvider ? serviceProvider : rootDocument.serviceProvider,
      getState().workpad.rootId,'Commit', new Date().getTime())

    dispatch({ type: "COMMIT ALL" });
  };
};

/**This function update content data from user (only for UI)
 * 
 * @param block The block was updated
 * @param newContent  new Content input from user (UI)
 */
export const updateContentFromUser = (block, newContent) => {
  return async (dispatch,getState) => {
    const tree = getState().workpad.tree
    const _draft = await uprtclData.data.getDraft<TextNode>(block.serviceProvider,block.id)
    _draft.text = newContent
    uprtclData.data.setDraft(block.serviceProvider,block.id,_draft)
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

/**
 * (WIP) change or switch between perspectives. 
 * @param _oldPerspective A block object of current perspective
 * @param _newPerspective A block object of new perspective
 */
export const changePerspective = (_oldPerspective, _newPerspective) => {
  return async(dispatch,getState) => {
    const perspectiveFull =  await getMasterTree(getState) 
    dispatch({ type: "CHANGE PERSPECTIVE", tree: readBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
  }
}

/**
 * (WIP) Create a new perspective given a parten perspective 
 * @param _perspectiveToClone a Block object that represent perspective to clone
 * @param _message A lil and cool message from the user
 * 
 */
export const newPerspective = (_perspectiveToClone, _message) => {
  return async(dispatch,getState) => {
    const perspectiveFull =  await getMasterTree(getState) 
    dispatch({ type: "NEW PERSPECTIVE", tree: readBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
  }
}

/**
 * (WIP) Merge two perspectives and get a new perspective in same origin (that destination)
 * @param _origin a block that represent origin perspective
 * @param _destination  a block that represent destination perspective
 */
export const mergePerspectives = (_origin, _destination) => {
  return async(dispatch,getState) => {
    const perspectiveFull =  await getMasterTree(getState) 
    dispatch({ type: "MERGE", tree: readBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
  }
}
import { UprtclData } from "./services/uprtcl-data";
import { PerspectiveFull, TextNodeFull, TextNode } from "./types";

export enum NodeType {
  "title",
  "paragraph"
}
export interface Block {
  id: string,
  children: string[],
  status: "DRAFT" | "COMMITED",
  content: string,
  style: NodeType,
  parentId: string
}

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
  
  if (!_perspective.head) {
    return true;
  }
  
  let node = _perspective.head.data;
  let draft = _perspective.draft;

  if (!node) {
    return true;
  }

  if (draft != null) {
    let textEqual = node.text === draft.text;
    let linksEqual = node.links.length === draft.links.length;
    for (let i = 0; i < node.links.length; i++) {
      linksEqual =
        linksEqual &&
        node.links[i].link === draft.links[i].link;
      // TODO: compare position...
    }

    return !(textEqual && linksEqual);
  }

  return false;
};

const getPerspectiveData = (perspective: PerspectiveFull): TextNodeFull => {
  if (hasChanges(perspective)) {
    return perspective.draft;
  } else {
    return perspective.head.data;
  }
};

const mapBlockToTextNode = (block: Block): TextNode => {
  let textNode: TextNode = {
    text: block.content,
    type: NodeType[block.style],
    links: block.children.map(childId => { return { link: childId } })
  }
  return textNode;
}

const mapPerspectiveToBlockRec = (
  perspectiveFull: PerspectiveFull,
  tree,
  parentId: string
): void => {
  let data = getPerspectiveData(perspectiveFull);

  const block: Block = {
    id: perspectiveFull.id,
    children: [],
    status: hasChanges(perspectiveFull) ? "DRAFT" : "COMMITED",
    content: data.text,
    style: NodeType[data.type],
    parentId: parentId
  };

  data.links.map(link => {
    mapPerspectiveToBlockRec(link.link, tree, parentId);
    block.children.push(link.link.id);
  });

  tree[perspectiveFull.id] = block;

  return;
};

const getMasterTree = async (getState): Promise<PerspectiveFull> =>  { 
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
      tree: mapPerspectiveToBlockRec(perspectiveFull, t, getState().workpad.rootId)
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

export const newBlock = (block: Block, initiatorId: string) => {
  return async (dispatch, getState) => {
    
    const tree = getState().workpad.tree;
    const initNode = tree[initiatorId];

    switch (initNode.style) {
      case "title":
        /** An enter on a title will create an empty subcontext *
         *  as the first subcontext of the title context.       */
        uprtclData.initContextUnder(
          initNode.serviceProvider,
          initNode.id,
          0,
          block.content
        );
      break;

      case "paragraph":
        /** An enter on a paragraph will create an empty context *
         *  as the next-sibling of that paragraph.               */
        const parentnode = tree[initNode.parentPerspectiveID];
        const index = parentnode.children.findIndex(pId => pId === initiatorId)

        await uprtclData.initContextUnder(
          parentnode.serviceProvider,
          parentnode.id,
          index + 1,
          ''
        );
      break;
    }

    /** force tree update */
    const perspectiveFull = await getMasterTree(getState);

    const newTree = Object.assign({},mapPerspectiveToBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId))
    dispatch({ type: "NEW BLOCK", tree: newTree});
  };
};

export const setView = async (blockId: string, newStyle: NodeType) => {
  return async (dispatch, getState) => {
    
    const tree = getState().workpad.tree;
    const block: Block = tree[blockId];
    const index = block.children.findIndex(pId => pId === blockId)

    switch (block.style) {
      case NodeType.title: 
        switch (newStyle) {
          
          /** title to title: setting the same view changes nothing */
          case NodeType.title: 
            return;
          
          /** title to paragraph: changing the type of a title to a paragraph 
           *  will move all its subcontexts as younger siblings of the new typed 
           *  paragraph */            
          case NodeType.paragraph:
            let removeChildren = block.children.map( async (childId) => {
              return uprtclData.removePerspective(blockId, childId);
            })

            /** removing in parallel */
            await Promise.all(removeChildren);

            /** adding in sequence */
            for (let childIx = 0; childIx < block.children.length; childIx++) {
              let childId = block.children[childIx];
              await uprtclData.insertPerspective(
                block.parentId,
                childId,
                index + childIx + 1);
            }

          break;
        }

      break;
    }

    block.style = newStyle;
    await uprtclData.draft.setDraft(blockId, mapBlockToTextNode(block));

    /** force update */
    const perspectiveFull =  await getMasterTree(getState) 
    dispatch({ 
      type: "SET VIEW", 
      tree: mapPerspectiveToBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)
    });
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
    await uprtclData.removePerspective(block.parentPerspectiveID, block.id)
    const perspectiveFull =  await getMasterTree(getState) 
    dispatch({ type: "REMOVE BLOCK", tree: mapPerspectiveToBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
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
    const _draft = await uprtclData.draft.getDraft(block.id)
    _draft.text = newContent
    uprtclData.draft.setDraft(block.id,_draft)
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
    dispatch({ type: "CHANGE PERSPECTIVE", tree: mapPerspectiveToBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
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
    dispatch({ type: "NEW PERSPECTIVE", tree: mapPerspectiveToBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
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
    dispatch({ type: "MERGE", tree: mapPerspectiveToBlockRec(perspectiveFull, getState().workpad.tree, getState().workpad.rootId)});
  }
}
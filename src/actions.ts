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

/** ----- SUPPORT FUNCTIONS ------ */

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

const reloadMasterTree = async (getState): Promise<any> =>  { 
  let perspectiveFull = await uprtclData.getPerspectiveFull(
    getState().workpad.rootId, -1);

  let _tree = {}
  mapPerspectiveToBlockRec(perspectiveFull, _tree, getState().workpad.rootId)
  return _tree;
}

/** ----- ACTIONS FUNCTIONS ------ */

/** This method sets a new root ID and deletes the 
 * tree. It should be followed by a reload tree.
 */
export const initTree = (_rootId) => {
  return (dispatch) => {
    dispatch({ 
      type: "INIT_TREE", 
      rootId: _rootId, 
      tree: {} 
    })
  };
};

export const reloadTree = () => {
  return async (dispatch, getState) => {
    let _tree = await reloadMasterTree(getState);
    dispatch({
      type: "RELOAD_TREE",
      tree: _tree
    });
  };
};

/** This method (WIP) create a new draft for a perspective. This method force to reload
 *
 * @param block
 *
 */
export const setContent = (blockId, content) => {
  return async (dispatch, getState) => {

    uprtclData.setDraftText(blockId, content);

    let _tree = await reloadMasterTree(getState);
    dispatch({ 
      type: "SET_CONTENT", 
      tree: _tree
    });
  };
};

export const newBlock = (_content, initiatorId: string) => {
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
          _content
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
    let _tree = await reloadMasterTree(getState);
    dispatch({ 
      type: "NEW_BLOCK", 
      tree: _tree
    });
  };
};

export const setStyle = async (blockId: string, newStyle: NodeType) => {
  return async (dispatch, getState) => {
    
    const tree = getState().workpad.tree;
    const block: Block = tree[blockId];
    const index = block.children.findIndex(pId => pId === blockId)

    /** set the new style */
    block.style = newStyle;
    await uprtclData.draft.setDraft(blockId, mapBlockToTextNode(block));

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

      case NodeType.paragraph:

        switch (newStyle) {

          /** paragraph to paragraph: setting the same view changes nothing */
          case (NodeType.paragraph):
            return;
          
          /** paragraph to title: Changing the type of a paragraph to a title 
           * will move all the younger sibling contexts of the paragraph as 
           * subcontexts of the new title. */
          case (NodeType.title):
            const parent: Block = tree[block.parentId];
            
            let youngerSyblings = parent.children.splice(index + 1);
            
            /** just move the syblings up to the first one which is a title */
            let indexOfTitleSybling = youngerSyblings.findIndex(syblingId => {
              let sybling: Block = tree[syblingId];
              return sybling.style === NodeType.title
            })
            /** there is a title younger sybling */
            if (indexOfTitleSybling !== -1) {
              youngerSyblings = youngerSyblings.slice(0, indexOfTitleSybling);
            }

            /** adding in sequence */
            for (let sybIx = 0; sybIx < youngerSyblings.length; sybIx++) {
              let sybId = youngerSyblings[sybIx];
              await uprtclData.insertPerspective(blockId, sybId, -1);
            }
          break;
        }
      break;
    }

    /** force update */
    let _tree = await reloadMasterTree(getState);
    dispatch({ 
      type: "SET_STYLE", 
      tree: _tree
    });
  }
}


/**
 * This method remove a block (perspective indeed) from tree.
 * @param {*} block
 * @returns dispatch a reloadTree event
 */
export const removeBlock = block => {
  return async(dispatch, getState) => {
    await uprtclData.removePerspective(block.parentPerspectiveID, block.id)
    let _tree = await reloadMasterTree(getState);
    dispatch({ 
      type: "REMOVE_BLOCK", 
      tree: _tree
    });
  }
};

/**
 * Commits the draft of the block specified by blockId and recursively
 * of all its children. Send the rootId to commit the entire document.
 */
export const commitGlobal = (blockId: string, message: string = '') => {
  return async (dispatch, getState) => {
    
    let provider = getState().support.selectedProvider;
    
    await uprtclData.commitGlobal(
      provider,
      blockId,
      message, 
      new Date().getTime())

    let _tree = await reloadMasterTree(getState);
    dispatch({ 
      type: "COMMIT_ALL",
      tree: _tree
    });
  };
};

/**
 * This function open the contextual menu
 */
export const openMenu = (blockId) => {
  return (dispatch) => {
    dispatch({type: 'OPEN_MENU', isClose:false,blockId})
  }
}

/**
 * This function close the contextual menu
 */
export const closeMenu = () => {
  return (dispatch) => {
    dispatch({type: 'CLOSE_MENU', isClose:true})
  }
}


/**
 * 
 */
export const newPerspective = (
  blockId: string, 
  name: string, 
  serviceProvider: string) => {

  return async (dispatch) => {

    let newPerspectiveId = await uprtclData.createGlobalPerspective(
      serviceProvider, blockId, name
    )

    dispatch({ 
      type: "NEW_PERSPECTIVE", 
      rootId: newPerspectiveId
    });
  }
}

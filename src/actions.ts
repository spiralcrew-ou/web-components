import { uprtclData } from './services/uprtcl-data';
import { PerspectiveFull, TextNodeFull } from './types';

export enum NodeType {
  title = 'title',
  paragraph = 'paragraph'
}
export interface Block {
  id: string;
  children: string[];
  status: string;
  content: string;
  style: NodeType;
  serviceProvider: string;
}

/** ----- SUPPORT FUNCTIONS ------ */

const getPerspectiveData = (perspective: PerspectiveFull): TextNodeFull => {
  if (perspective.draft) {
    return perspective.draft;
  } else {
    if (perspective.head) {
      return perspective.head.data;
    } else {
      null;
    }
  }
};

const mapPerspectiveToBlock = (perspectiveFull: PerspectiveFull): Block => {
  let data = getPerspectiveData(perspectiveFull);

  const block: Block = {
    id: perspectiveFull.id,
    children: [],
    status: perspectiveFull.draft != null ? 'DRAFT' : 'COMMITED',
    content: data ? data.text : '',
    style: data ? NodeType[data.type] : NodeType.paragraph,
    serviceProvider: perspectiveFull.origin
  };

  return block;
};

const setTreeWithPerspectiveRec = (perspectiveFull: PerspectiveFull, tree) => {
  let block = mapPerspectiveToBlock(perspectiveFull);
  let data = getPerspectiveData(perspectiveFull);

  if (data) {
    data.links.map(link => {
      setTreeWithPerspectiveRec(link.link, tree);
      block.children.push(link.link.id);
    });
  }

  tree[perspectiveFull.id] = block;
};

const reloadMasterTree = async (getState): Promise<any> => {
  let perspectiveFull = await uprtclData.getPerspectiveFull(
    getState().workpad.rootId,
    -1
  );

  let _tree = {};
  setTreeWithPerspectiveRec(perspectiveFull, _tree);

  let textNodeTree = await uprtclData.toTextNodeTree(getState().workpad.rootId);
  console.log('[REDUX] Reload master tree.', {
    textNodeTree,
    perspectiveFull,
    _tree
  });
  return _tree;
};

/** ----- ACTIONS FUNCTIONS ------ */

/** This method sets a new root ID and deletes the
 * tree. It should be followed by a reload tree.
 */
export const initTree = _rootId => {
  return dispatch => {
    dispatch({
      type: 'INIT_TREE',
      rootId: _rootId,
      tree: {}
    });
  };
};

export const reloadTree = () => {
  return async (dispatch, getState) => {
    let _tree = await reloadMasterTree(getState);
    dispatch({
      type: 'RELOAD_TREE',
      tree: _tree
    });
    dispatch(renderingWorkpad(false));
  };
};

/** This method (WIP) create a new draft for a perspective. This method force to reload
 *
 * @param block
 *
 */
export const setContent = (blockId: string, content: string) => {
  return async (dispatch, getState) => {
    await uprtclData.setDraftText(blockId, content);
    const perspectiveFull = await uprtclData.getPerspectiveFull(blockId, 0);

    let block = getState().workpad.tree[blockId];
    block = mapPerspectiveToBlock(perspectiveFull);
    const tree = Object.assign({}, getState().workpad.tree);
    tree[blockId] = block;
    dispatch({ type: 'SET_CONTENT', tree });
  };
};

export const newBlock = (
  blockId: string,
  _content: string,
  parentId: string,
  index: number
) => {
  return async (dispatch, getState) => {
    const tree = getState().workpad.tree;
    const initNode: Block = tree[blockId];

    switch (initNode.style) {
      case 'title':
        /** An enter on a title will create an empty subcontext *
         *  as the first subcontext of the title context.       */
        uprtclData.initContextUnder(
          initNode.serviceProvider,
          initNode.id,
          0,
          _content,
          NodeType.paragraph
        );
        break;

      case 'paragraph':
        /** An enter on a paragraph will create an empty context *
         *  as the next-sibling of that paragraph.               */
        const parent: Block = tree[parentId];
        if (!parent)
          throw new Error(
            `Parent perspective ${parentId} not found in the tree`
          );

        await uprtclData.initContextUnder(
          parent.serviceProvider,
          parent.id,
          index + 1,
          '',
          NodeType.paragraph
        );
        break;

      default:
        throw new Error(`'Unexpected style value ${initNode.style}`);
    }

    /** force tree update */
    dispatch({ type: 'NEW_BLOCK', initNode });
    dispatch(reloadTree());
  };
};

export const setStyle = (
  blockId: string,
  newStyle: NodeType,
  parentId: string,
  index: number
) => {
  return async (dispatch, getState) => {
    const tree = getState().workpad.tree;
    const block: Block = tree[blockId];
    const parent: Block = tree[parentId];
    if (!parent)
      throw new Error(`Parent perspective ${parentId} not found in the tree`);

    /** set the new style */
    let oldStyle = block.style;
    block.style = newStyle;
    await uprtclData.setDraftType(blockId, newStyle);

    switch (oldStyle) {
      case NodeType.title:
        switch (newStyle) {
          /** title to title: setting the same view changes nothing */
          case NodeType.title:
            return;

          /** title to paragraph: changing the type of a title to a paragraph
           *  will move all its subcontexts as youngr siblings of the new typed
           *  paragraph */

          case NodeType.paragraph:
            /** removing in sequence (parallel wont work due to index finding) */
            for (let childIx = 0; childIx < block.children.length; childIx++) {
              /** remove n times the first element */
              await uprtclData.removePerspective(blockId, 0);
            }

            /** adding in sequence */
            for (let childIx = 0; childIx < block.children.length; childIx++) {
              let childId = block.children[childIx];
              await uprtclData.insertPerspective(
                parentId,
                childId,
                index + childIx + 1
              );
            }
            break;
        }
        break;

      case NodeType.paragraph:
        switch (newStyle) {
          /** paragraph to paragraph: setting the same view changes nothing */
          case NodeType.paragraph:
            return;

          /** paragraph to title: Changing the type of a paragraph to a title
           * will move all the younger sibling contexts of the paragraph as
           * subcontexts of the new title. */
          case NodeType.title:
            let youngerSyblings = parent.children.splice(index + 1);

            /** just move the syblings up to the first one which is a title */
            let indexOfTitleSybling = youngerSyblings.findIndex(syblingId => {
              let sybling: Block = tree[syblingId];
              return sybling.style === NodeType.title;
            });
            /** there is a title younger sybling */
            if (indexOfTitleSybling !== -1) {
              youngerSyblings = youngerSyblings.slice(0, indexOfTitleSybling);
            }

            /** removing in sequence (parallel wont work due to index finding) */
            for (let sybIx = 0; sybIx < youngerSyblings.length; sybIx++) {
              /** remove n times the next block */
              await uprtclData.removePerspective(parent.id, index + 1);
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
    dispatch({ type: 'SET_STYLE', block });
    dispatch(reloadTree());
  };
};

/**
 * This method removes a block (perspective indeed) from tree. It removes
 * all its children automatically, se beware!
 */
export const removeBlock = (parentId: string, index: number) => {
  return async dispatch => {
    await uprtclData.removePerspective(parentId, index);
    dispatch(reloadTree());
  };
};

/**
 * If the block is of type title, and its parent is not the rootId (meaning
 * the block is at level two or below), it makes the block (together with its children)
 * a younger sybling of the title parent
 */
export const indentLeft = (
  blockId: string,
  parentId: string,
  index: number
) => {
  return async (dispatch, getState) => {
    const tree = getState().workpad.tree;
    const rootId = getState().workpad.rootId;

    if (parentId === rootId || blockId === rootId) return;

    /** level 2 or more */
    const block: Block = tree[blockId];

    if (block.style !== NodeType.title) return;

    let grandParentId = Object.keys(tree).find(key =>
      tree[key].children.includes(parentId)
    );
    let parentIx = tree[grandParentId].children.findIndex(
      id => id === parentId
    );

    if (!grandParentId) return;
    if (parentIx == -1) return;

    /** remove this block from parent */
    await uprtclData.removePerspective(parentId, index);

    /** add it to the  this block from parent */
    await uprtclData.insertPerspective(grandParentId, blockId, parentIx + 1);

    dispatch(reloadTree());
  };
};

/** Commits the draft of the block specified by blockId and recursively
f all its children. Send the rootId to commit the entire document.
 */
export const commitGlobal = (blockId: string, message: string = '') => {
  return async (dispatch, getState) => {
    let block: Block = getState().workpad.tree[blockId];

    /** create the data in the perspective provider by default */
    let perspective = await uprtclData.uprtcl.getPerspective(blockId);
    let provider = perspective.origin;

    await uprtclData.commit(
      provider,
      blockId,
      message,
      new Date().getTime(),
      true
    );

    dispatch({ type: 'COMMIT_GLOBAL', block });
    dispatch(reloadTree());
  };
};

export const pullPerspective = (blockId: string) => {
  return async (dispatch, getState) => {
    await uprtclData.pull(blockId);

    const tree = getState().workpad.tree;
    const block: Block = tree[blockId];

    dispatch({ type: 'PULL_MADE', block });
    dispatch(reloadTree());
  };
};

export const mergePerspective = (
  toPerspective: string,
  fromPerspectiveId: string
) => {
  return async (dispatch, getState) => {
    const tree = getState().workpad.tree;
    const block: Block = tree[toPerspective];

    await uprtclData.merge(toPerspective, [fromPerspectiveId]);

    dispatch({ type: 'MERGE_MADE', block });
    dispatch(reloadTree());
  };
};

/**
 *
 */
export const newPerspective = (
  blockId: string,
  name: string,
  serviceProvider: string
) => {
  return async dispatch => {
    let newPerspectiveId = await uprtclData.createGlobalPerspective(
      serviceProvider,
      blockId,
      name
    );

    // TODO, reuse a tree reload or something
    let perspectiveFull = await uprtclData.getPerspectiveFull(
      newPerspectiveId,
      -1
    );

    let _tree = {};
    setTreeWithPerspectiveRec(perspectiveFull, _tree);

    dispatch({
      type: 'NEW_PERSPECTIVE',
      rootId: newPerspectiveId,
      tree: _tree
    });
  };
};

/**
 *
 */
export const checkoutPerspective = (perspectiveId: string) => {
  return async dispatch => {
    // TODO, reuse a tree reload or something
    let perspectiveFull = await uprtclData.getPerspectiveFull(
      perspectiveId,
      -1
    );

    let _tree = {};
    setTreeWithPerspectiveRec(perspectiveFull, _tree);
    dispatch({
      type: 'CHECKOUT_PERSPECTIVE',
      rootId: perspectiveId,
      tree: _tree
    });
    dispatch(renderingWorkpad(false));
  };
};

/**
 * This function open the contextual menu
 */
export const openMenu = (
  blockId: string,
  parentId: string,
  index: number,
  calledBy: string
) => {
  return dispatch => {
    dispatch({
      type: 'OPEN_MENU',
      isClose: false,
      inBlockData: {
        blockId,
        parentId,
        index,
        calledBy
      }
    });
  };
};

/**
 * This function close the contextual menu
 */
export const closeMenu = () => {
  return dispatch => {
    dispatch({ type: 'CLOSE_MENU', isClose: true });
  };
};

export const setPerspectiveToAct = perspectiveId => {
  return async dispatch => {
    let perspective: PerspectiveFull = await uprtclData.getPerspectiveFull(
      perspectiveId,
      0
    );
    dispatch({ type: 'SET_PERSPECTIVE_TO_ACT', perspective });
  };
};

export const setPerspectiveToActAndUpdateContextPerspectives = (
  perspectiveId: string
) => {
  return async dispatch => {
    let perspective: PerspectiveFull = await uprtclData.getPerspectiveFull(
      perspectiveId,
      0
    );
    let contextPerspectives = await uprtclData.uprtcl.getContextPerspectives(
      perspective.context.id
    );

    dispatch({
      type: 'UPDATE_CONTEXT_PERSPECTIVES',
      perspective,
      contextPerspectives
    });
  };
};

export const setAvailableProviders = (availableProviders: string[]) => {
  return dispatch => {
    dispatch({ type: 'SET_AVAILABLE_PROVIDERS', availableProviders });
  };
};

export const setSelectedProvider = (selectedProvider: string) => {
  return dispatch => {
    dispatch({ type: 'SET_SELECTED_PROVIDER', selectedProvider });
  };
};

export const setEthAccount = (ethAccount: string) => {
  return dispatch => {
    dispatch({ type: 'SET_ETH_ACCOUNT', ethAccount });
  };
};

export const renderingWorkpad = (value: boolean) => {
  return dispatch => {
    dispatch({ type: 'RENDERING_WORKPAD', isRendering: value });
  };
};

export const watchTasks = () => {
  return dispatch => {
    uprtclData.uprtcl.taskQueue.onTasksPending(() =>
      dispatch({ type: 'TASKS_PENDING', pendingTasks: true })
    );
    uprtclData.uprtcl.taskQueue.onTasksFinished(() =>
      dispatch({ type: 'TASKS_PENDING', pendingTasks: false })
    );
  };
};

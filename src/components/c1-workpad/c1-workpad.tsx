import {
  Component, State, Prop, Element, Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, initWorkPad,reloadTree, removeBlock, newDraft, commitAll  } from '../../actions';
import { Z_BLOCK } from 'zlib';

const commited = 'text-gray-800 p-2 mx-8 font-light bg-red-100 break-words'
const unCommited = 'text-gray-800 p-2 mx-8 font-light break-words'


@Component({
  tag: 'c1-workpad',
  styleUrl: 'c1-workpad.scss',
  shadow: true
})
export class Workpad {
  @Element() _element: HTMLElement;
  @State() blocks
  @Prop({ context: 'store' }) store: Store;
  @Prop() documentId: string

  initWorkPad: Action
  newBlock: Action
  removeBlock: Action 
  newDraft: Action
  updateTree: Action
  reloadTree: Action
  commitAll: Action
  

  findBlock(_blockId: string) {
    return this.blocks[_blockId]
  }


  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock,
      newDraft,
      initWorkPad,
      reloadTree,
      commitAll
      
    })
    this.initWorkPad(this.documentId);
    this.reloadTree();
    this.store.mapStateToProps(this, state => {
      return {
        blocks: Object.assign([], state.workpad.tree)  //  When U work with [], this is the only way to force render
      }
    })
  }


  componentDidUpdate() {
    console.log('Render')
    this.blocks.forEach(b => {
      console.log(b)
      const element = this._element.shadowRoot.getElementById(b.id)
      if (element) element.innerHTML = b.content;
    })
  }

  commit() {
    this.commitAll()
    this.reloadTree()
  }


  render() {
    Object.keys(this.blocks).map(id => console.log(id))
    return (
      <div>
        <co-node class='container'>
          id={this.documentId}
        </co-node>
        <button class='border-red-700 uppercase' onClick={() => this.commit()}> Commit </button>
      </div> 
    )
  }

}
/*
@Component(
  co-node
)
{
  @Prop() id: string;
  @Prop() parentId: string;
  @Prop() index: string;

  @State() block;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => {
      return {
        block: Object.assign([], state.workpad.tree[this.id])
      }
    })
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if ((this.block.style == 'title') || (this.block.style == 'bullet_list')) {
        this.newBlock({ status: 'DRAFT', content: '',type: 'paragraph'}, this.id, 0)
      } else {
        this.newBlock({ status: 'DRAFT', content: '',type: 'paragraph'}, this.parentId,  this.index + 1)
      }
    }

    if (event.key === 'Backspace') {
      if (event['path'][0].innerText === '') {
        this.removeBlock(this.findBlock(this.id))
        /**TODO: What happend if document have only one element? That means, 
         * we need to consireded if user try to remove all blocks from document. 
         *  It make sense? 
         * IMPORTANT TO SEE WITH PEPO. User delete only one word and then type the same word. 
         * We need to create a new Draft in this case? 
          */
/*
        // this.updateTree(newTree)
      }
    }
  }

  render() {
    return (
      <div>
        <div id={this.id + this.parentId + '-content'} onchange=this.updateContent()>
          {this.block.content}
        </div>
        {this.block.children.map((childId, index) => {
          (
            <co-node class='container'>
              id={childId},
              parentId={this.id}
              index=index
            </co-node>
          )
        })}
      </div> 
    )
  }
}*/
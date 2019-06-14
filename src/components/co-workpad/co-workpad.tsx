import {
  Component, State, Prop, Element, 
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, initWorkPad,reloadTree, removeBlock, newDraft, commitAll  } from '../../actions';

// const commited = 'text-gray-800 p-2 mx-8 font-light bg-red-100 break-words'
// const unCommited = 'text-gray-800 p-2 mx-8 font-light break-words'


@Component({
  tag: 'co-workpad',
  styleUrl: 'co-workpad.scss',
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
import {
  Component, State, Prop, Element, Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, updateTree } from '../../actions';
import { configureStore } from '../../store.js';




const commited = 'text-gray-800 p-2 mx-8 font-light bg-red-100 break-words'
const unCommited = 'text-gray-800 p-2 mx-8 font-light break-words'


@Component({
  tag: 'c1-workpad',
  styleUrl: 'c1-workpad.scss',
  shadow: true
})
export class Workpad {
  @Element() _element: HTMLElement;
  @State() blocks: Array<any>
  @Prop({ context: 'store' }) store: Store;
  @Prop() documentId: String

  newBlock: Action
  updateTree: Action

  findBlock(_blockId: string) {
    return this.blocks.filter(b => b.id === _blockId)[0]
  }


  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    //ParentId 
    const idBlockUpdated = event['path'][0].id

    if (this.findBlock(idBlockUpdated).content != event['path'][0].innerText && this.findBlock(idBlockUpdated).status === 'COMMITED') {
      this.findBlock(idBlockUpdated).status = 'DRAFT'
      this.updateTree(Object.assign([], this.blocks))
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      let block = this.findBlock(idBlockUpdated)
      block.content = event['path'][0].innerText
      this.newBlock({ status: 'DRAFT', content: '',lens: 'paragraph'},idBlockUpdated )
    }

    if (event.key === 'Backspace') {
      if (event['path'][0].innerText === '') {
        const newTree = Object.assign([], this.blocks.filter(b => b.id != idBlockUpdated))

        if (newTree.length === 0) {
          newTree.push({ status: 'DRAFT', content: '',lens: 'paragraph'},idBlockUpdated )
        }

        this.updateTree(newTree)
      }
    }

  }

  componentWillLoad() {
    this.store.setStore(configureStore());
    this.store.mapDispatchToProps(this, {
      newBlock,
      // setRoot,
      updateTree
    })
    // this.setRoot()
    // this.reloadTree()

    this.store.mapStateToProps(this, state => {
      return {
        blocks: Object.assign([], state.workpad.tree)  //  When U work with [], this is the only way to force render
      }
    })
  }

  updateAllTree() { 

  }

  componentDidUpdate() {
    console.log('Render')
    this.blocks.forEach(b => {
      console.log(b)
      const element = this._element.shadowRoot.getElementById(b.id)
      if (element) element.innerHTML = b.content;
    })
  }

  commitAll() {

  }


  render() {
    return (
      <div class='container'>
        {this.blocks.map((b) => (
          <div
            id={b.id}
            contentEditable
            onBlur ={() => console.log('foco')}
            class={b.status === 'DRAFT' ? commited : unCommited} data-placeholder='Enter text here'>{b.content}</div>
        ))}

        <button class='border-red-700 uppercase' onClick={() => this.commitAll()}> Commit </button>
      </div>)
  }

  // Helper functions
  
}
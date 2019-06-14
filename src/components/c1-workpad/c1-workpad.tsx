import {
  Component, State, Prop, Element, Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, initWorkPad,reloadTree, removeBlock, newDraft, commitAll  } from '../../actions';

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


  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    const idBlockUpdated = event['path'][0].id

    if (this.findBlock(idBlockUpdated).content != event['path'][0].innerText && this.findBlock(idBlockUpdated).status === 'COMMITED') {
      /** UI detects that this block have been change. For these reason need create a new draft for
       * same perspective
       */
      this.newDraft(this.findBlock(idBlockUpdated))
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
        this.removeBlock(this.findBlock(idBlockUpdated))
        /**TODO: What happend if document have only one element? That means, 
         * we need to consireded if user try to remove all blocks from document. 
         *  It make sense? 
         * IMPORTANT TO SEE WITH PEPO. User delete only one word and then type the same word. 
         * We need to create a new Draft in this case? 
          */

        // this.updateTree(newTree)
      }
    }

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
    this.initWorkPad(this.documentId)
    this.reloadTree()
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
      <div class='container'>
        {Object.keys(this.blocks).map((id) => (
          <div
            id={this.blocks[id].id}
            contentEditable
            onBlur ={() => console.log('foco')}
            class={this.blocks[id].status === 'DRAFT' ? commited : unCommited} data-placeholder='Enter text here'>{this.blocks[id].content}</div>
        ))}
        <button class='border-red-700 uppercase' onClick={() => this.commit()}> Commit </button>
      </div>)
  }

  
}
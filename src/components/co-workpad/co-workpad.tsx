import {
  Component, State, Listen, Prop, Element
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, updateTree } from '../../actions';
import { generateDataId } from '../../main_functions';


class Block {
  id: string = ''
  status: string = 'draft'
  content: string = ''

  constructor(_status: string, _content: string) {
    this.id = generateDataId()
    this.status = _status
    this.content = _content
  }
}

const commited = 'text-gray-800 p-2 mx-8 font-light bg-red-200 break-words'
const unCommited = 'text-gray-800 p-2 mx-8 font-light break-words'

@Component({
  tag: 'co-workpad',
  styleUrl: 'co-workpad.scss',
  shadow: true
})
export class COWorkPad {

  @Element() _element: HTMLElement;
  @State() blocks: Array<Block>
  @Prop({ context: 'store' }) store: Store;

  findBlock(_blockId: string): Block {
    return this.blocks.filter(b => b.id === _blockId)[0]
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    const idBlockUpdated = event['path'][0].id

    if (this.findBlock(idBlockUpdated).content != event['path'][0].innerText && this.findBlock(idBlockUpdated).status==='COMMITED') {
      this.findBlock(idBlockUpdated).status = 'DRAFT'
      this.updateTree(Object.assign([],this.blocks))
    } 
      
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      let block = this.findBlock(idBlockUpdated)
      block.content = event['path'][0].innerText
      this.newBlock(new Block('DRAFT', ''), this.blocks,idBlockUpdated)
    }

    if (event.key === 'Backspace') {
      if (event['path'][0].innerText === '') {
        const newTree = Object.assign([], this.blocks.filter(b => b.id != idBlockUpdated))

        if (newTree.length === 0) {
          newTree.push(new Block('DRAFT', ''))
        }

        this.updateTree(newTree)
      }
    }

  }

  newBlock: Action
  updateTree: Action

  commitAll() {
    const newTree = Object.assign([],this.blocks)
    newTree.map(b => b.status ='COMMITED')
    this.updateTree(newTree)
  }

  /*
  componentWillUpdate() {
    this.blocks.forEach(b => {
      const element = this.element.shadowRoot.getElementById(b.id)
      if (element) element.innerHTML = b.content;
    })
  }*/

  componentWillLoad() {
    const b = []
    b.push(new Block('DRAFT', ''))
    this.blocks = Object.assign([], b)

    const firstBlock = new Block('DRAFT', '')

    this.store.mapDispatchToProps(this, {
      newBlock,
      updateTree
    })
    this.newBlock(firstBlock, [],null)

    this.store.mapStateToProps(this, state => {
      return {
        blocks: Object.assign([], state.workpad.tree) //  When U work with [], this is the only way to force render
      }
    })


  }

  render() {
    window['blocks'] = this.blocks
    return (
      <div class='container'>
        {this.blocks.map((b:Block) => (
          <div
            id={b.id}
            contentEditable
            class={b.status === 'DRAFT' ? commited : unCommited} data-placeholder='Enter text here'></div>
        ))}

        <button class='border-red-700 uppercase' onClick={() => this.commitAll()}> Commit </button>
      </div>)

  }
}

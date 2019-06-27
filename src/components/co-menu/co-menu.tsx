import { Component, Element, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  setStyle,
  renderingWorkpad,
  pullPerspective,
  NodeType,
  Block,
  setPerspectiveToAct
} from '../../actions';

import Popper from 'popper.js'

@Component({
  tag: 'co-menu',
  styleUrl: 'co-menu.scss',
  shadow: true
})
export class COMenu {
  @Element() _element: HTMLElement;
  @Prop({ context: 'store' }) store: Store;

  @Prop() reference: string
  @Prop() parentId: string
  @Prop() index: number
  @State() block: Block
  @State() rootId: string
  @Prop() color: string
  @Prop() show: boolean 

  @Event({ eventName: 'showInputCommit', bubbles: true }) showInputCommit: EventEmitter
  @Event({ eventName: 'showInputNewPerspective', bubbles: true }) showInputNewPerspective: EventEmitter
  @Event({ eventName: 'showInputChangePerspective', bubbles: true }) showInputChangePerspective: EventEmitter
  @Event({ eventName: 'showInputMerge', bubbles: true }) showInputMerge: EventEmitter
  @Event({ eventName: 'showInputInfo', bubbles: true }) showInputInfo: EventEmitter

  setStyle: Action
  pullPerspective: Action

  renderingWorkpad: Action
  setPerspectiveToAct: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setStyle,
      renderingWorkpad,
      pullPerspective,
      setPerspectiveToAct
    })

    this.store.mapStateToProps(this, state => {
      return {
        block: state.workpad.tree[this.reference],
        rootId: state.workpad.rootId,
      }
    })
  }

  callPull() {
    this.pullPerspective(this.rootId);
  }

  open() {
    const menu = this._element.shadowRoot.getElementById(`${this.block.id}`) as any
    const caller = this._element.shadowRoot.getElementById(`caller${this.block.id}`)
    menu.style.display = 'block'
    new Popper(caller, menu, {
      placement: 'auto'
    })

  }

  close() {
    const menu = this._element.shadowRoot.getElementById(this.block.id) as any
    menu.style.display = 'none'
  }


  setBlockStyle(newStyle: NodeType) {
    this.setStyle(this.block.id, newStyle, this.parentId, this.index)
    this.close()
  }


  render() {
    
      
    const isRootDocument = this.block.id === this.rootId
    return (
      <div class='mainContainer px-2'>
        <div id={this.block.id} class='hidden  m-4 w-64 border-2 shadow-md p-2 rounded-lg font-thin z-10 bg-white'>
          <div class='menuContainer px-2'>

            <div class='row' onClick={() => {this.setBlockStyle(NodeType.title)}}>
              {!isRootDocument ? <div class='block my-1'> This is a title</div> : ''}
              {!isRootDocument ? <img class='w-8 h-8 ' src='../../assets/img/uppercase.svg'></img> : ''}
            </div>

            <div class='row pb-2 border-b' onClick={() => { this.setBlockStyle(NodeType.paragraph)}}>
              {!isRootDocument ? <div class='my-1' >this is a paragraph</div> : ''}
              {!isRootDocument ? <img class='w-8 h-8 ' src='../../assets/img/lowercase.svg'></img> : ''}
            </div>

            <div class='row pt-2' onClick={() => {
                this.callPull()
                this.close()
              }}>
              <div class='py-1' > Pull</div>
              <img class='w-8 h-8 ' src='../../assets/img/pull.svg'></img>
            </div>

            <div class='row' onClick={() => {
                this.setPerspectiveToAct(this.block.id)
                this.showInputCommit.emit(true)
                this.close()
              }}>
              <div class='py-1' > Commit</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/net.svg'></img>
            </div>

            <div class='row' onClick={() => {
                this.setPerspectiveToAct(this.block.id)
                this.showInputNewPerspective.emit(true)
                this.close()
              }}>
              <div class='py-1' > New Perspective</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/new_perspective.svg'></img>
            </div>

            <div class='row' onClick={() => {
                this.setPerspectiveToAct(this.block.id)
                this.showInputChangePerspective.emit(true)
                this.close()
              }}>
              <div class='py-1' > Change Perspective</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/switch.svg'></img>
            </div>

            <div class="row pb-2" onClick={() => {
                this.setPerspectiveToAct(this.block.id)
                this.showInputMerge.emit(true)
                this.close()
              }}>
              <div class='my-1' > Merge</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/merge.svg'></img>
            </div>

            <div class="row pt-2 border-t" onClick={() => {
                this.setPerspectiveToAct(this.block.id)
                this.showInputInfo.emit(true)
                this.close()
              }}>
              <div class='my-1' > Info</div>
              <img class='w-6 h-6 inline-block' src='../../assets/img/info.svg'></img>
            </div>

            <div class='row' onClick={() => this.close()}>
              <div class='my-1'>Close</div>
              <img class='w-10 h-10 inline-block' src='../../assets/img/close.svg'></img>
            </div>

          </div>
        </div>
              { this.show ? 
                <img id={`caller${this.reference}`} onClick={() => this.open()} class='w-4 h-4' src={`../../assets/img/menu_${this.color ? this.color : 'gray'}.svg`}></img>
                : ''
              }
      </div>
    )
  }
}

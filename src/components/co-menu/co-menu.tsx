import { Component, Element, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  setStyle,
  renderingWorkpad,
  pullPerspective,
  NodeType,
  Block,
  setPerspectiveToAct,
  setPerspectiveToActAndUpdateContextPerspectives
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

  @Event({ eventName: 'showInputCommit', bubbles: true }) showInputCommit: EventEmitter
  @Event({ eventName: 'showInputNewPerspective', bubbles: true }) showInputNewPerspective: EventEmitter
  @Event({ eventName: 'showInputChangePerspective', bubbles: true }) showInputChangePerspective: EventEmitter
  @Event({ eventName: 'showInputMerge', bubbles: true }) showInputMerge: EventEmitter
  @Event({ eventName: 'showInputInfo', bubbles: true }) showInputInfo: EventEmitter

  setStyle: Action
  pullPerspective: Action

  renderingWorkpad: Action
  setPerspectiveToAct: Action
  setPerspectiveToActAndUpdateContextPerspectives: Action
  
  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setStyle,
      renderingWorkpad,
      pullPerspective,
      setPerspectiveToAct,
      setPerspectiveToActAndUpdateContextPerspectives
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

  renderTypographyMenu() {
    
  }

  render() {
    const isRootDocument = this.block.id === this.rootId
    return (
        <div class='mainContainer'>
          <div id={this.block.id} class='hidden  m-4 w-64 border-2 shadow-md p-2 rounded-lg font-thin z-10 bg-white'>
            <div class='menuContainer'>
             
              {!isRootDocument ? <div class='block my-1' onClick={() => {
                  this.setBlockStyle(NodeType.title)
                }}> This is a title</div> :  ''}
                

              {!isRootDocument ? <img class='w-8 h-8 ' src='../../assets/img/uppercase.svg'></img> : ''}
              

              {!isRootDocument ? <div class='my-1' onClick={() => {
                this.setBlockStyle(NodeType.paragraph)
              }}>this is a paragraph</div>: ''}

              {!isRootDocument ? <img class='w-8 h-8 ' src='../../assets/img/lowercase.svg'></img> : ''}

              <div class='my-1' onClick={() => {
                this.callPull()
                this.close()
              }}> Pull</div>
              <img class='w-8 h-8 ' src='../../assets/img/net.svg'></img>

              <div class='my-1' onClick={async () => {
                await this.setPerspectiveToAct(this.block.id)
                this.showInputCommit.emit(true)
                this.close()
              }}> Commit</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/net.svg'></img>

              <div class='my-1' onClick={async () => {
                await this.setPerspectiveToAct(this.block.id)
                this.showInputNewPerspective.emit(true)
                this.close()
              }}> New Perspective</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/new_perspective.svg'></img>

              <div class='my-1' onClick={async () => {
                await this.setPerspectiveToActAndUpdateContextPerspectives(this.block.id)
                this.showInputChangePerspective.emit(true)
                this.close()
              }}> Change Perspective</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/switch.svg'></img>

              <div class='my-1' onClick={async () => {
                await this.setPerspectiveToActAndUpdateContextPerspectives(this.block.id)
                this.showInputMerge.emit(true)
                this.close()
              }}> Merge</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/merge.svg'></img>

              <div class='my-1' onClick={async () => {
                await this.setPerspectiveToActAndUpdateContextPerspectives(this.block.id)
                this.showInputInfo.emit(true)
                this.close()
              }}> Info</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/merge.svg'></img>

              <div class='my-1' onClick={async () => {
                window.location.href = `/?pid=${this.block.id}`
              }}> Go</div>
              <img class='w-6 h-6 inline-block ' src='../../assets/img/merge.svg'></img>

              <div class='my-1' onClick={() => this.close()}>Close</div>
              <img class='w-10 h-10 inline-block' src='../../assets/img/close.svg'></img>
              
            </div>
          </div>
          <img id={`caller${this.reference}`} onClick={() => this.open()} class='w-6 h-6' src='../../assets/img/menu.svg'></img>
        </div>
        )
      }
    }

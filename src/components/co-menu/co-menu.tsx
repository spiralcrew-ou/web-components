import { Component, Element, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { 
  setStyle, 
  renderingWorkpad, 
  NodeType, 
  Block,
  perspectiveToCreate, 
  perspectiveToCommit,
  perspectiveToChange,
  perspectiveToMerge } from '../../actions';

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
  
  @Event({ eventName: 'showInputCommit', bubbles: true }) showInputCommit: EventEmitter


  setStyle: Action

  renderingWorkpad: Action
  perspectiveToCreate: Action
  perspectiveToCommit: Action
  perspectiveToChange: Action
  perspectiveToMerge: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setStyle,
      renderingWorkpad,
      perspectiveToCreate, 
      perspectiveToCommit,
      perspectiveToChange,
      perspectiveToMerge
    })

    this.store.mapStateToProps(this, state => {
      return {
        block: state.workpad.tree[this.reference],

      }
    })
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
    const menu =  this._element.shadowRoot.getElementById(this.block.id) as any
    menu.style.display = 'none'
  } 


  setBlockStyle(newStyle: NodeType) {
    this.setStyle(this.block.id, newStyle, this.parentId, this.index)
    this.close()
  }

  render() {
    
    return (
    <div>
    <div id={this.block.id} class='hidden container m-4 w-auto border-2 shadow-md p-2 rounded-lg font-thin z-10 bg-white'>
      <div class='row'>
      <div class= 'block my-2 pl-2' onClick={ () => {
        this.setBlockStyle(NodeType.title)
      }}> This is a title</div>
      </div>
      <div  class= 'block my-2 pl-2 '  onClick={ () => {
        this.setBlockStyle(NodeType.paragraph)
      }}>this is a paragraph</div>
      <div onClick={() => this.close()}>{this.reference}</div>
      <div onClick={() => {
        this.perspectiveToCommit(this.block.id)
        this.showInputCommit.emit(true)
        this.close()
      }}> Commit</div>
    </div>
    <img id={`caller${this.reference}`} onClick= {() => this.open()} class='w-6 h-6' src='../../assets/img/menu.svg'></img>
    </div> 
    )
  }
}

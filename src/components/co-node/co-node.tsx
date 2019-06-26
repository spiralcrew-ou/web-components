import {
  Component, State, Prop, Element, Listen, Event, EventEmitter
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock, reloadTree, setContent, openMenu, Block, renderingWorkpad } from '../../actions';
// import Popper from 'popper.js';

@Component({
  tag: 'co-node',
  styleUrl: 'co-node.scss',
  shadow: true
})
export class CONode {
  @Element() _element: HTMLElement;

  @Prop({ context: 'store' }) store: Store;
  @Prop() temp: string
  @Prop() nodeid: string;
  @Prop() parentid: string;
  @Prop() indexinparent: number;

  block : Block;
  @State() tree
  @State() isFocused: boolean = false;
  @Event({ eventName: 'isRunning', bubbles: true }) isRunning: EventEmitter
  

  rootId; 
  emptyOnce = false;
  
  newBlock: Action
  removeBlock: Action
  reloadTree: Action
  setContent: Action
  openMenu: Action
  renderingWorkpad: Action
 

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock,
      reloadTree,
      setContent,
      openMenu,
      renderingWorkpad
    })
    this.store.mapStateToProps(this,(state) => {
      return {
        tree: Object.assign({},state.workpad.tree),
        rootId: state.workpad.rootId,
        block: state.workpad.tree[this.nodeid]
      }
    })
    
  }


  componentDidLoad() {
    const conode = this._element.shadowRoot.getElementById(this.block.id);
    if (conode) conode.focus();

    const element = this._element.shadowRoot.getElementById(this.nodeid);
    if (element) element.innerHTML = this.block.content
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.newBlock(
        this.nodeid, 
        '', 
        this.parentid, 
        this.indexinparent);  
    }
  }

  @Listen('keyup')
  onKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Backspace') {
      if (event['path'][0].innerText === '') {
        if (!this.emptyOnce) {
          this.emptyOnce = true;
        } else {
          this.removeBlock(this.parentid, this.indexinparent);
        }
        /**TODO: First node. 
          */
      }
    } else {
      this.emptyOnce = false;
    }

  }

  async updateBlockContent(_event:FocusEvent, _newContent) { 
    _event.stopPropagation()   
    if (this.block) {
      if (_newContent != this.block.content)
        await this.setContent(this.block.id, _newContent)
    }
  }

  render() {
    
    
    this.block = this.tree[this.nodeid]
    const isDocTitle = this.block.id === this.rootId
    const blockClasses = 'text-gray-800 p-2 leading-relaxed'
    const focusClasses = this.isFocused ? 'bg-gray-200' :  ''
    const titleClasses = this.block.style === 'title' ? 'text-2xl' : ''
    const paragraphClasses =  this.block.style ==='paragraph' ? 'font-light px-2 py-2 ' : ''
    const commitedClasses = ''
    const classes = [
      blockClasses, 
      commitedClasses,
      titleClasses,
      paragraphClasses].join(" ")

    const containerClasses = [focusClasses, 'container'].join(" ")

    const contentBlock = <div class='row h-12'>
                            <div 
                              key={this.nodeid}
                              onBlur={event => {
                                this.isFocused = false;
                                this.updateBlockContent(event,event['path'][0].innerText)
                              }}
                              onFocus={() => {this.isFocused = true}}
                              class= {classes} 
                              data-placeholder = {'More options, press "/" '}
                              id={this.nodeid} 
                              contentEditable>
                             {this.block.content}
                            </div>
                            
                            <co-menu  
                              class={this.nodeid}  
                              reference={this.nodeid} 
                              parent-id={this.parentid}
                              index={this.indexinparent} >
                            </co-menu>
                          </div>
    

    return ( 
      <div class={containerClasses}>
        {!isDocTitle ? contentBlock : ''}        
        {this.block.children.map((childId, index) => {
           return(
            <co-node 
              nodeid={childId} 
              parentid={this.block.id} 
              indexinparent={index}>
            </co-node>
          )
        })}
      </div>
    )
  }
}
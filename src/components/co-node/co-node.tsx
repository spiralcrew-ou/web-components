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
  @Prop() nodeId: string;
  @Prop() parentId: string;
  @Prop() indexInParent: number;

  @State() block : Block;
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
        tree: state.workpad.tree,
        rootId: state.workpad.rootId,
        block: state.workpad.tree[this.nodeId]
      }
    })

  }

  componentDidLoad() {
    const conode = this._element.shadowRoot.getElementById(this.block.id);
    if (conode) conode.focus();
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.newBlock(
        this.nodeId, 
        '', 
        this.parentId, 
        this.indexInParent);  
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
          this.removeBlock(this.parentId, this.indexInParent);
        }
        /**TODO: First node. 
          */
      }
    } else {
      this.emptyOnce = false;
    }

    if(event.key === '/'){
      this.openMenu(this.nodeId, this.parentId, this.indexInParent);
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
                              onBlur={event => {
                                this.isFocused = false;
                                this.updateBlockContent(event,event['path'][0].innerText)
                              }}
                              onFocus={() => {this.isFocused = true}}
                              class= {classes} 
                              data-placeholder = {'More options, press "/" '}
                              id={this.nodeId} 
                              contentEditable>
                              {this.block.content}
                            </div>
                            
                            <co-menu  
                              class={this.nodeId}  
                              reference={this.nodeId} 
                              parent-id={this.parentId}
                              index={this.indexInParent} >
                            </co-menu>
                          </div>
    

    return ( 
      <div class={containerClasses}>
        {!isDocTitle ? contentBlock : ''}        
        {this.block.children.map((childId, index) => {
           return(
            <co-node 
              node-id={childId} 
              parent-id={this.block.id} 
              index-in-parent={index}>
            </co-node>
          )
        })}
      </div>
    )
  }
}
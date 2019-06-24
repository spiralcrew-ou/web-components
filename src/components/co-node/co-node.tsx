import {
  Component, State, Prop, Element, Listen, Event, EventEmitter
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock, reloadTree, setContent, openMenu, Block, renderingWorkpad } from '../../actions';




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
  rootId; 
  @State() showMenuOption: boolean;
  @State() isFocused: boolean = false;
  @Event({ eventName: 'isRunning', bubbles: true }) isRunning: EventEmitter
  
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
        block: state.workpad.tree[this.nodeId],
        showMenuOption: !state.menu.isClose
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
      this.renderingWorkpad(true)
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
        this.removeBlock(this.block)
        /**TODO: First node. 
          */
      }
    }

    if(event.key === '/'){
      this.openMenu(this.nodeId, this.parentId, this.indexInParent);
    }
  }

  async updateBlockContent(_event:FocusEvent, _newContent) { 
    _event.stopPropagation()   
    if (_newContent != this.block.content)
      await this.setContent(this.block.id, _newContent)
  }

  render() {
    const isDocTitle = this.block.id === this.rootId
    const blockClasses = 'text-gray-800 p-2 leading-relaxed'
    const draftClasses = this.block.status === 'DRAFT'  ?  'has-changes'  :  '' 
    const focusClasses = this.isFocused ? 'bg-gray-200' :  ''
    const titleClasses = this.block.style === 'title' ? 'text-2xl' : ''
    const paragraphClasses =  this.block.style ==='paragraph' ? 'font-light px-2 py-2 ' : ''
    const commitedClasses = ''
    const classes = [
      blockClasses, 
      draftClasses, 
      commitedClasses,
      titleClasses,
      paragraphClasses].join(" ")

    const containerClasses = [focusClasses, 'container'].join(" ")

    const contentBlock = <div 
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
import {
  Component, State, Prop, Element, Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock, reloadTree, setContent, openMenu, Block } from '../../actions';

@Component({
  tag: 'co-node',
  styleUrl: 'co-node.scss',
  shadow: true
})
export class CONode {
  @Element() _element: HTMLElement;
  @Prop({ context: 'store' }) store: Store;
  @Prop() nodeId: string;
  @State() block : Block;
  @State() rootId; 
  @State() showMenuOption: boolean;
  @State() isFocused: boolean = false;
  
  newBlock: Action
  removeBlock: Action
  reloadTree: Action
  setContent: Action
  openMenu: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock,
      reloadTree,
      setContent,
      openMenu
    })
    this.store.mapStateToProps(this,(state) => {
      return {
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
      this.newBlock(this.nodeId, '');
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
      this.openMenu(this.nodeId)
    }
  }

  updateBlockContent(event:FocusEvent, newContent) { 
    event.stopPropagation()
    this.setContent(this.block.id, newContent)
  }


  render() {
    const isDocTitle = this.block.id === this.block.parentId 
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
        {this.block.children.map((childId) => {
           return(
            <co-node node-id={childId}>
            </co-node>
          )
        })}
      </div>
    )
  }
}
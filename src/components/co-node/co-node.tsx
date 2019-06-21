import {
  Component, State, Prop, Element, Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock,reloadTree, updateContentFromUser, openMenu } from '../../actions';

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
  @Prop() index: string;
  @State() hasUIChanges: boolean = false
  @State() block;
  @State() tree; 
  @State() showMenuOption: boolean
  
  newBlock: Action
  removeBlock: Action
  reloadTree: Action
  updateContentFromUser: Action
  openMenu: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock,
      reloadTree,
      updateContentFromUser,
      openMenu
    })
    this.store.mapStateToProps(this,(state) => {
      return {
        tree: Object.assign({}, state.workpad.tree), 
        block: Object.assign({}, state.workpad.tree[this.nodeId]),
        showMenuOption: !state.menu.isClose
      }
    })
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if ((this.block.style == 'title') || (this.block.style == 'bullet_list')) {
        this.newBlock({ status: 'DRAFT', content: '', type: 'paragraph' }, this.nodeId)
      } else {
        this.newBlock({ status: 'DRAFT', content: '', type: 'paragraph' }, this.nodeId)
      }
      this.updateContentFromUser(this.block,event['path'][0].innerText)
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

    if (!['Backspace', 'Enter'].find(e => e === event.key)){
      this.hasUIChanges = (this.tree[this.nodeId]['content'] !=event['path'][0].innerText)
    }

    if(event.key === '/'){
      this.openMenu(this.nodeId)
    }
  }

  
  /*
  componentWillUpdate() {
    const element = this._element.shadowRoot.getElementById(this.nodeId);
    if (element) element.innerHTML = this.block.content;
  }*/


  updateBlockContent(event:FocusEvent, newContent) { 
    event.stopPropagation()
    this.updateContentFromUser(this.block,newContent)
  }


  render() {
    const isDocTitle = this.block.id === this.block.parentPerspectiveID 
    const blockClasses = 'text-gray-800 p-2 leading-relaxed'
    const draftClasses = this.hasUIChanges  ?  'bg-red-100'  :  '' 
    const titleClasses = this.block.style ==='title' ? 'text-5xl' : ''
    const paragraphClasses =  this.block.style ==='paragraph' ? 'font-light px-2 py-2 ' : ''
    const commitedClasses = ''
    const classes = [blockClasses, draftClasses, commitedClasses,titleClasses,paragraphClasses].join(" ")

    const contentBlock = <div 
                          onBlur={event => {if (this.hasUIChanges && !this.showMenuOption) this.updateBlockContent(event,event['path'][0].innerText)}}
                          class= {classes} 
                          data-placeholder = {'More options, press "/" '}
                          id={this.nodeId} 
                          contentEditable>
                          {this.block.content}
                        </div>

    return ( 
      <div class='container'>
        {!isDocTitle ? contentBlock : ''}        
        {this.block.children.map((childId, index) => {
           return(
            <co-node
              node-id={childId} 
                parent-id={this.nodeId}
              index={index}>
            </co-node>
          )
        })}
      </div>
    )
  }
}
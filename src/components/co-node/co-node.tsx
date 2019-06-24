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
  @State() hasUIChanges: boolean = false
  @State() block : Block;
  @State() rootId; 
  @State() showMenuOption: boolean
  
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
        rootId: state.workpad.rooId,
        block: state.workpad.tree[this.nodeId],
        showMenuOption: !state.menu.isClose
      }
    })
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

  /*
  componentDidUpdate() {
    const element = this._element.shadowRoot.getElementById(this.block.id);
    if (element) element.innerHTML = this.block.content
  }*/


  updateBlockContent(event:FocusEvent, newContent) { 
    event.stopPropagation()
    this.setContent(this.block.id, newContent)
  }


  render() {

    let _content = ''
    const element = this._element.shadowRoot.getElementById(this.block.id);

    if (element){
      _content = element.innerHTML != this.block.content ? this.block.content : ''
    } else {
      _content = this.block.content
    }
    
    
    console.log(element && element.innerHTML != this.block.content ?  this.block.content : '')
    

    const isDocTitle = this.block.id === this.block.parentId 
    const blockClasses = 'text-gray-800 p-2 leading-relaxed'
    const draftClasses = this.hasUIChanges  ?  'bg-red-100'  :  '' 
    const titleClasses = this.block.style ==='title' ? 'text-5xl' : ''
    const paragraphClasses =  this.block.style ==='paragraph' ? 'font-light px-2 py-2 ' : ''
    const commitedClasses = ''
    const classes = [blockClasses, draftClasses, commitedClasses,titleClasses,paragraphClasses].join(" ")

    const contentBlock = <div 
                          onBlur={event => {this.updateBlockContent(event,event['path'][0].innerText)}}
                          class= {classes} 
                          data-placeholder = {'More options, press "/" '}
                          id={this.nodeId} 
                          contentEditable>
                          {_content}
                        </div>
    

    return ( 
      <div class='container'>
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
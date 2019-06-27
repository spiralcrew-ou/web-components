import {
  Component, State, Prop, Element, Listen, Event, EventEmitter
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock, indentLeft, reloadTree, setContent, openMenu, Block, renderingWorkpad } from '../../actions';

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
  indentLeft: Action
  reloadTree: Action
  setContent: Action
  openMenu: Action
  renderingWorkpad: Action
 

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock,
      indentLeft,
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
      console.log(this.rootId,this.nodeid)
      if (this.rootId!=this.nodeid) { 
        this.newBlock(
          this.nodeid, 
          '', 
          this.parentid, 
          this.indexinparent);  
      }
    }
  }

  @Listen('keyup')
  onKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Backspace') {

      /** https://stackoverflow.com/a/54333903/1943661 */
      var sel = document.getSelection();
      sel['modify']("extend", "backward", "paragraphboundary");
      var pos = sel.toString().length;
      sel.collapseToEnd();
  
      if (event['path'][0].innerText === '') {
        if (!this.emptyOnce) {
          this.emptyOnce = true;
        } else {
          this.removeBlock(this.parentid, this.indexinparent);
        }
        /**TODO: First node. 
          */
      } else {
        if (pos === 0) {
          if (this.parentid && (this.parentid !== this.rootId)) {
            /** indentn left up to level 1 */
            console.log('Indent Left')
            this.indentLeft(this.block.id, this.parentid, this.indexinparent);
          }          
        }
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
    const commitedClasses = this.block.status === 'DRAFT' ? 'border-l border-red-800' : ''
    const classes = [
      blockClasses, 
      commitedClasses,
      titleClasses,
      paragraphClasses].join(" ")

    const containerClasses = [focusClasses].join(" ")

    const contentBlock = <div class='row min-h-2 ml-2'>
                            <div 
                              key={this.nodeid}
                              onFocus={() => {this.isFocused = true}}
                              class= {classes} 
                              onBlur={event => {
                                this.isFocused = false;
                                this.updateBlockContent(event,event['path'][0].innerText)
                              }}
                              data-placeholder = {'Please write here '}
                              id={this.nodeid} 
                              contentEditable>
                             {this.block.content}
                            </div>
                            
                            <co-menu  
                              show
                              class={`menu ${this.nodeid}`}  
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
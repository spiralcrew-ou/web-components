import {
  Component, State, Prop, Element, Listen, Event, EventEmitter
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock, indentLeft, reloadTree, openMenu, Block, renderingWorkpad } from '../../actions';

@Component({
  tag: 'co-node',
  styleUrl: 'co-node.scss',
  shadow: false
})
export class CONode {
  @Element() _element: HTMLElement;

  @Prop({ context: 'store' }) store: Store;
  @Prop() temp: string
  @Prop() nodeid: string;
  @Prop() level: number;
  @Prop() parentid: string;
  @Prop() indexinparent: number;
  
  @State() block: Block;
  @State() tree
  @State() isFocused: boolean = false;
  @State() ethAccount: string = '';
  @Event({ eventName: 'isRunning', bubbles: true }) isRunning: EventEmitter

  rootId;
  emptyOnce = false;

  newBlock: Action
  removeBlock: Action
  indentLeft: Action
  reloadTree: Action
  openMenu: Action
  renderingWorkpad: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock,
      indentLeft,
      reloadTree,
      openMenu,
      renderingWorkpad
    })
    this.store.mapStateToProps(this, (state) => {
      return {
        tree: Object.assign({}, state.workpad.tree),
        rootId: state.workpad.rootId,
        block: state.workpad.tree[this.nodeid],
        ethAccount: state.support.ethAccount
      }
    })
  }

  componentDidLoad() {
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      console.log(this.rootId, this.nodeid)
      if (this.rootId != this.nodeid) {
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

  canWrite(): boolean {
    return !this.block.serviceProvider.startsWith('eth://') || this.ethAccount === this.block.creatorId; 
  }

  @Listen('isFocused')
  isFocusedHandler(event: CustomEvent) {
    event.stopPropagation();
    this.isFocused = event.detail
  }
  
  render() {
    const focusClasses = this.isFocused ? 'bg-gray-200' :  ''
    const commitedClasses = this.block.status === 'DRAFT' ? 'draft-block' : ''
    
    const nodeRowClasses = [commitedClasses].concat(["node-row"]).join(" ")
    const containerClasses = [focusClasses].concat(["node-row"]).join(" ")

    return (
      <div class={containerClasses}>
        <div class={nodeRowClasses}>
          <div class="node-content">
            <co-node-content 
              block={this.block} 
              level={this.level} 
              canwrite={this.canWrite()}>
            </co-node-content>
          </div>
          
          <div class="node-menu">
            {true ? (
              <co-menu
                show
                class={`menu ${this.nodeid}`}
                reference={this.nodeid}
                parent-id={this.parentid}
                index={this.indexinparent} >
              </co-menu>) : ''}
          </div>
          
        </div>
        
        {this.block.children.map((childId, index) => {
          return (
            <co-node
              level={this.level + 1}
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
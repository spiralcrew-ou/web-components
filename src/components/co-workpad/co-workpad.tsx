import {
  Component, State, Prop, Element, Listen, Event, EventEmitter
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {  commitGlobal, setContent,openMenu, newBlock, Block } from '../../actions';

@Component({
  tag: 'co-workpad',
  styleUrl: 'co-workpad.scss',
  shadow: true
})
export class Workpad {
  @Element() _element: HTMLElement;
  @State() tree
  @State() rootDocumentId: string
  @Prop({ context: 'store' }) store: Store;
  @State() titleHasChange: boolean
  @Prop() documentId: string
  @State() showMenuOption: boolean
  @State() isRunning: boolean = false
  @State() loading: boolean = true
  @State() pendingTasks: boolean = false
  @State() ethAccount: string = ''
  @State() block: Block

  @Event({ eventName: 'isStarting', bubbles: true }) isStarting: EventEmitter

  @Event({ eventName: 'showInputCommit', bubbles: true }) showInputCommit: EventEmitter
  @State() openInputCommit: boolean

  @Event({ eventName: 'showInputNewPerspective', bubbles: true }) showInputNewPerspective: EventEmitter
  @State() openInputNewPerspective: boolean

  @Event({ eventName: 'showInputChangePerspective', bubbles: true }) showInputChangePerspective: EventEmitter
  @State() openInputChangePerspective: boolean

  @Event({ eventName: 'showInputMerge', bubbles: true }) showInputMerge: EventEmitter
  @State() openInputMerge: boolean

  @Event({ eventName: 'showInputInfo', bubbles: true }) showInputInfo: EventEmitter
  @State() openInputInfo: boolean

  
  commitGlobal: Action
  setContent: Action
  openMenu: Action
  newBlock: Action

  async componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      openMenu,
      commitGlobal,
      setContent,
      newBlock
    })
   
    this.store.mapStateToProps(this, state => {
      if (Object.keys(state.workpad.tree).length > 0) {
        this.isStarting.emit(false);
        this.loading = false;
      }
      return {
        tree: state.workpad.tree,
        rootDocumentId: state.workpad.rootId,
        showMenuOption: !state.menu.isClose,
        isRunning: state.workpad.isRendering,
        pendingTasks: state.workpad.pendingTasks,
        ethAccount: state.support.ethAccount,
        block: state.workpad.tree[this.documentId]
      }
    })
    
  }

  @Listen('keyup')
  onKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    this.titleHasChange = (this.tree[this.rootDocumentId]['content'] != event['path'][0].innerText)
  }

  @Listen('showInputCommit')
  showInputCommitHandler(event: CustomEvent) {
    this.openInputCommit = event.detail
  }

  @Listen('showInputNewPerspective')
  showInputNewPerspectiveHandler(event: CustomEvent) {
    this.openInputNewPerspective = event.detail
  }

  @Listen('showInputChangePerspective')
  showInputChangePerspectiveHandler(event: CustomEvent) {
    this.openInputChangePerspective = event.detail
  }

  @Listen('showInputMerge')
  showInputMergeHandler(event: CustomEvent) {
    this.openInputMerge = event.detail
  }

  @Listen('showInputInfo')
  showInputInfoHandler(event: CustomEvent) {
    this.openInputInfo = event.detail
  }


  updateDocumentTitle(newContent) {
    this.setContent(this.tree[this.rootDocumentId].id, newContent)
  }

  canWrite(): boolean {
    return this.block &&
      (!this.block.serviceProvider.startsWith('eth://')
       || this.ethAccount === this.block.creatorId); 
  }

  render() {
    if (this.isRunning || this.loading)
      return (<co-loading></co-loading>)

    return (
      <div class='workpad'>
        
        <div class="workpad-content">
          {this.openInputCommit ? <co-input-commit></co-input-commit> : ''}
          {this.openInputNewPerspective ? <co-input-new-perspective></co-input-new-perspective> : ''}
          {this.openInputChangePerspective ? <co-input-change-perspective></co-input-change-perspective> : ''}
          {this.openInputMerge ? <co-input-merge></co-input-merge> : ''}
          {this.openInputInfo ? <co-input-info></co-input-info> : ''}
        
          <co-node nodeid={this.rootDocumentId} level={0}>
          </co-node>

          <div class='clickZone h-16' onClick={() => this.newBlock(this.rootDocumentId, '', null, -1, true)}/>

        </div>
       
      </div>
    )
  }
}

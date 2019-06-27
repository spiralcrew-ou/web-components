import {
  Component, State, Prop, Element, Listen, Event, EventEmitter
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {  commitGlobal, setContent,openMenu } from '../../actions';

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

  async componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      openMenu,
      commitGlobal,
      setContent,
      
    })
   
    this.store.mapStateToProps(this, state => {
      return {
        tree: state.workpad.tree,
        rootDocumentId: state.workpad.rootId,
        showMenuOption: !state.menu.isClose,
        isRunning: state.workpad.isRendering
      }
    })
    this.isStarting.emit(false)
    
    
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

  render() {
    if (this.isRunning)
      return (<co-loading></co-loading>)

    return (
      <div class='workpad'>
        
        <header class='bg-red-700 mb-4 h-12 pl-2'
          onBlur={event => { if (this.titleHasChange) this.updateDocumentTitle(event['path'][0].innerText) }}
          contentEditable>
            <div class='py-4 px-2  text-white mb-8 w-full'>{this.tree[this.rootDocumentId].content}</div>
            <co-menu  
              class={this.rootDocumentId}  
              reference={this.rootDocumentId} 
              parent-id={null}
              index={0} >
            </co-menu>
          </header>

        <content>
          {this.openInputCommit ? <co-input-commit></co-input-commit> : ''}
          {this.openInputNewPerspective ? <co-input-new-perspective></co-input-new-perspective> : ''}
          {this.openInputChangePerspective ? <co-input-change-perspective></co-input-change-perspective> : ''}
          {this.openInputMerge ? <co-input-merge></co-input-merge> : ''}
          {this.openInputInfo ? <co-input-info></co-input-info> : ''}
        
          <co-node  nodeid={this.rootDocumentId}>
          </co-node>

          

        </content>
       
      </div>
    )
  }

}

/*<button class='rounded-full float-right bg-red-700 w-16 h-16 justify-center m-6 right-0.bottom-0' onClick={() => this.commit()}>
            <svg class='m-auto' xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <path fill="none" d="M0 0h24v24H0V0z" />
              <path fill='white' d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
            </svg>
          </button>*/
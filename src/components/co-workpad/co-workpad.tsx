import {
  Component, State, Prop, Element,Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { initWorkPad, reloadTree, commitAll,updateContentFromUser } from '../../actions';

// const commited = 'text-gray-800 p-2 mx-8 font-light bg-red-100 break-words'
// const unCommited = 'text-gray-800 p-2 mx-8 font-light break-words'


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

  initWorkPad: Action
  reloadTree: Action
  commitAll: Action
  updateContentFromUser: Action


  async componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      initWorkPad,
      reloadTree,
      commitAll,
      updateContentFromUser
    })
    await this.initWorkPad(this.documentId);
    await this.reloadTree();
    this.store.mapStateToProps(this, state => {
      return {
        tree: Object.assign({}, state.workpad.tree),
        rootDocumentId: state.workpad.rootId,
        showMenuOption: !state.menu.isClose
      }
    })
  }

  @Listen('keyup')
  onKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    this.titleHasChange = (this.tree[this.rootDocumentId]['content'] !=event['path'][0].innerText)
  }


  updateDocumentTitle(newContent) { 
    this.updateContentFromUser(this.tree[this.rootDocumentId],newContent)
  }


  commit() {
    this.commitAll()
    //this.reloadTree()
  }


  render() {
    return (
      <div class='workpad'>
        
        <header 
          class='bg-red-700  py-4 px-2  text-white mb-8' 
          onBlur={event => {if (this.titleHasChange) this.updateDocumentTitle(event['path'][0].innerText)}}
          contentEditable>{this.tree[this.rootDocumentId].content}</header>
        <content>
        {this.showMenuOption ? <co-menu></co-menu> : ''}
          <co-node class='container' node-id={this.documentId}>
          </co-node>
        </content>
        <footer class='text-color-white'>
          <button class='rounded-full float-right bg-red-700 w-16 h-16 justify-center m-6 right-0.bottom-0' onClick={() => this.commit()}>
            <svg class='m-auto' xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
              <path fill="none" d="M0 0h24v24H0V0z" />
              <path fill='white' d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
            </svg>
          </button>
        </footer>
      </div>
    )
  }

}
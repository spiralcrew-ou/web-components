import { Component, State, Event, EventEmitter, Prop } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { commitGlobal } from './../../actions';
import { PerspectiveFull } from './../../types';

@Component({
  tag: 'co-input-commit',
  styleUrl: 'co-input-commit.scss',
  shadow: true
})
export class COWorkspaceSelector {

  @Prop({ context: 'store' }) store: Store;
  @State() show: boolean = true;
  @State() message: string;
  @State() perspective: PerspectiveFull;

  @Event({ eventName: 'showInputCommit', bubbles: true }) showInputCommit: EventEmitter

  commitGlobal: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      commitGlobal
    })
    
    this.store.mapStateToProps(this, (state) => {
      return {
        perspective: state.workpad.perspective
      }
    })
  }

  handleMessage(event) {
    this.message = event.target.value
  }

  commit() {
    console.log('[INPUT-COMMIT] calling on', this.perspective);
    this.commitGlobal(this.perspective.id);
    this.showInputCommit.emit(false);
  }

  renderInput() {
    return <div class='container m-4 w-1/2 h-1/2 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>Commit</h2>
      <content>
        <input
          value={this.message}
          onChange={event => this.handleMessage(event)}
          class='ml-2 px-2 w-11/12 my-2 py-2 border-gray-600 border-b'
          placeholder='message (optional)'>
        </input>
      </content>
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputCommit.emit(false)}>Cancel</button>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.commit()}>Accept</button>
      </footer>
    </div>
  }

  render = () => this.show ? this.renderInput() : ''

}

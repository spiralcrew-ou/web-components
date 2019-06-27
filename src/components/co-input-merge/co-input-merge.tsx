import { Component, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  checkoutPerspective,
  mergePerspective,
  renderingWorkpad
} from '../../actions';
import { Perspective } from './../../types';

@Component({
  tag: 'co-input-merge',
  styleUrl: 'co-input-merge.scss',
  shadow: true
})
export class COInputMerge {

  @Prop({ context: 'store' }) store: Store;

  @State() show: boolean = true
  @State() perspectiveToMergeId: string
  @State() rootId: string
  @State() contextPerspectives: Perspective[]

  @Event({ eventName: 'showInputMerge', bubbles: true }) showInputMerge: EventEmitter

  mergePerspective: Action
  checkoutPerspective: Action
  renderingWorkpad: Action

  handleSelected(event) {
    this.perspectiveToMergeId = event.target.value
  }

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      mergePerspective,
      checkoutPerspective,
      renderingWorkpad
    })

    this.store.mapStateToProps(this, state => {
      return {
        rootId: state.workpad.rootId,
        contextPerspectives: state.workpad.contextPerspectives
      }
    })
  }

  async merge() {
    this.renderingWorkpad(true);
    await this.mergePerspective(this.rootId, this.perspectiveToMergeId);
    this.showInputMerge.emit(false)
  }

  renderInput() {
    return <div class='container m-4 w-1/2 h-1/2 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>Merge Perspective</h2>
      <content>
        <select onChange={event => this.handleSelected(event)}>
          <option value="">select</option>
          {this.contextPerspectives.filter(p => p.id != this.rootId).map(perspective => {
            return (<option value={perspective.id}>{perspective.name} - {perspective.origin} - {perspective.creatorId}</option>)
          })}
        </select>
      </content>
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputMerge.emit(false)}>Cancel</button>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.merge()}>Accept</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

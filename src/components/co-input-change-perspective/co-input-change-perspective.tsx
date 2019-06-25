import { Component, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  updateContextPerspectives,
  checkoutPerspective
} from '../../actions';
import { Perspective } from './../../types';

@Component({
  tag: 'co-input-change-perspective',
  styleUrl: 'co-input-change-perspective.scss',
  shadow: true
})
export class COInputChangePerspective {

  @Prop({ context: 'store' }) store: Store;

  @State() show: boolean = true
  @State() newPerspectiveId: string
  @State() rootId: string
  @State() contextPerspectives: Perspective[]

  @Event({ eventName: 'showInputChangePerspective', bubbles: true }) showInputChangePerspective: EventEmitter

  updateContextPerspectives: Action
  checkoutPerspective: Action

  handleSelected(event) {
    this.newPerspectiveId = event.target.value
  }

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      updateContextPerspectives,
      checkoutPerspective
    })

    this.store.mapStateToProps(this, state => {
      return {
        rootId: state.workpad.rootId,
        contextPerspectives: state.workpad.contextPerspectives
      }
    })

    this.updateContextPerspectives(this.rootId);
  }

  checkout() {
    this.checkoutPerspective(this.newPerspectiveId);
    this.showInputChangePerspective.emit(false)
  }

  renderInput() {
    return <div class='container m-4 w-1/2 h-1/2 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>Change Perspective</h2>
      <content>
        <select onChange={event => this.handleSelected(event)}>
          <option value="">select</option>
          {this.contextPerspectives.map(perspective => {
            return (<option value={perspective.id}>{perspective.name} - {perspective.origin} - {perspective.creatorId}</option>)
          })}
        </select>
      </content>
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputChangePerspective.emit(false)}>Cancel</button>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.checkout()}>Accept</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

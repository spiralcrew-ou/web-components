import { Component, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  checkoutPerspective,
  renderingWorkpad
} from '../../actions';
import { Perspective, PerspectiveFull } from './../../types';

@Component({
  tag: 'co-input-change-perspective',
  styleUrl: 'co-input-change-perspective.scss',
  shadow: true
})
export class COInputChangePerspective {

  @Prop({ context: 'store' }) store: Store;

  @State() show: boolean = true
  @State() newPerspectiveId: string
  @State() perspective: PerspectiveFull
  @State() contextPerspectives: Perspective[]

  @Event({ eventName: 'showInputChangePerspective', bubbles: true }) showInputChangePerspective: EventEmitter

  updateContextPerspectives: Action
  checkoutPerspective: Action
  renderingWorkpad: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      checkoutPerspective,
      renderingWorkpad
    })

    this.store.mapStateToProps(this, state => {
      return {
        perspective: state.workpad.perspective,
        contextPerspectives: state.workpad.contextPerspectives
      }
    })
  }

  perspectiveSelected(perspectiveId: string) {
    console.log('perspectiveId: ' + perspectiveId)
  }

  async checkout() {
    this.renderingWorkpad(true);
    window.location.href = `./?pid=${this.newPerspectiveId}`;
    this.showInputChangePerspective.emit(false)
  }

  renderInput() {
    return <div class='container m-4 w-auto h-auto border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white text-gray-800 text-sm '>
      <h2 class='text-3xl m-2'>Changes Perspective</h2>
      <co-perspective-selector 
        perspectives={this.contextPerspectives.filter(p => p.id != this.perspective.id)}>
      </co-perspective-selector>
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputChangePerspective.emit(false)}>Cancel</button>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.checkout()}>Accept</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

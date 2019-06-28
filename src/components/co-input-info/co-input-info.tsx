import { Component, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  renderingWorkpad
} from '../../actions';
import { Perspective, PerspectiveFull } from '../../types';

@Component({
  tag: 'co-input-info',
  styleUrl: 'co-input-info.scss',
  shadow: true
})
export class COInputInfo {

  @Prop({ context: 'store' }) store: Store;

  @State() show: boolean = true
  @State() perspective: PerspectiveFull
  @State() contextPerspectives: Perspective[]

  @Event({ eventName: 'showInputInfo', bubbles: true }) showInputInfo: EventEmitter

  renderingWorkpad: Action

  
  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      renderingWorkpad
    })

    this.store.mapStateToProps(this, state => {
      return {
        contextPerspectives: state.workpad.contextPerspectives,
        perspective: state.workpad.perspective,
        loadingPerspective: state.workpad.loadingPerspective
      }
    })
  }

  renderInput() {
    return <div class='container m-4 w-auto h-auto border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>Perspective Info</h2>
      <content class='ml-2'>
          <b>name:</b><p>{this.perspective.name}</p>
          <b>id:</b><p class="hash-id">{this.perspective.id}</p>
          <b>origin:</b><p class="hash-id">{this.perspective.origin}</p>
          <b>context id:</b><p class="hash-id">{this.perspective.context.id}</p>
          <b>owner:</b><p class="hash-id">{this.perspective.creatorId}</p>
          <b>head id:</b><p class="hash-id">{this.perspective.head ? this.perspective.head.id : null}</p>
          <b>data id:</b><p class="hash-id">{this.perspective.head ? this.perspective.head.data.id : null}</p>
          <b>other perspectives:</b><br/>
      </content>
      {this.contextPerspectives.filter(p => p.id != this.perspective.id).map(perspective => {
            return (<co-perspective-info perspective={perspective}></co-perspective-info>)
          })}
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputInfo.emit(false)}>Close</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

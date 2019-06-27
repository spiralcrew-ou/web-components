import { Component, State, Prop, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  updateContextPerspectives,
  renderingWorkpad
} from '../../actions';
import { Perspective, PerspectiveFull } from '../../types';

@Component({
  tag: 'co-input-info',
  styleUrl: 'co-input-info.scss',
  shadow: true
})
export class COInputMerge {

  @Prop({ context: 'store' }) store: Store;

  @State() show: boolean = true
  @State() perspective: PerspectiveFull
  @State() rootId: string
  @State() contextPerspectives: Perspective[]

  @Event({ eventName: 'showInputInfo', bubbles: true }) showInputInfo: EventEmitter

  updateContextPerspectives: Action
  mergePerspective: Action
  checkoutPerspective: Action
  renderingWorkpad: Action

  async componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      updateContextPerspectives,
      renderingWorkpad
    })

    this.store.mapStateToProps(this, state => {
      return {
        rootId: state.workpad.rootId,
        contextPerspectives: state.workpad.contextPerspectives,
        perspective: state.workpad.perspective
      }
    })

    await this.updateContextPerspectives(this.rootId);
  }

  renderInput() {
    return <div class='container m-4 w-auto h-auto border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>Perspective Info</h2>
      <content class='ml-2'>
          <b>name:</b><p>{this.perspective.name}</p>
          <b>id:</b><p>{this.perspective.id}</p>
          <b>origin:</b><p>{this.perspective.origin}</p>
          <b>context id:</b><p>{this.perspective.context.id}</p>
          <b>head id:</b><p>{this.perspective.head ? this.perspective.head.id : null}</p>
          <b>data id:</b><p>{this.perspective.head ? this.perspective.head.data.id : null}</p>
          <b>other perspectives:</b><br/>
      </content>
      {this.contextPerspectives.filter(p => p.id != this.rootId).map(perspective => {
            return (<div class='otherPerspectives break-words'>
                      <span class='ml-2'>{perspective.id}</span>
                      <span >{perspective.name} - {perspective.origin}- {perspective.creatorId}</span>
                    </div>)
          })}
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputInfo.emit(false)}>Close</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

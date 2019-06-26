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
    return <div class='container m-4 w-1/2 h-1/2 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>Perspective Info</h2>
      <content>
        <div>
          <div><b>name:</b><br/>{this.perspective.name}</div>
          <div><b>id:</b><br/>{this.perspective.id}</div>
          <div><b>origin:</b><br/>{this.perspective.origin}</div>
          <div><b>context id:</b><br/>{this.perspective.context.id}</div>
          <div><b>head id:</b><br/>{this.perspective.head ? this.perspective.head.id : null}</div>
          <div><b>data id:</b><br/>{this.perspective.head ? this.perspective.head.data.id : null}</div>
        </div>
        <div>
          <b>other perspectives:</b><br/>
          {this.contextPerspectives.filter(p => p.id != this.rootId).map(perspective => {
            return (<div>
                      - {perspective.id}<br/>
                        {perspective.name} - {perspective.origin} - {perspective.creatorId}
                    </div>)
          })}
        </div>
      </content>
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputInfo.emit(false)}>Close</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

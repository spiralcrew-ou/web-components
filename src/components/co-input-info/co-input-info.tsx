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
    return <div class='container m-4 w-auto h-auto border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm break-words '>
      <h2 class='text-3xl m-2'>{this.perspective.name}</h2>
      <content class='ml-2'>
          <b class='font-medium'>id</b><p  class='font-mono text-xs'>{this.perspective.id}</p>
          <b class='font-medium'>origin</b><p  class='font-mono text-xs'>{this.perspective.origin}</p>
          <b class='font-medium'>context id</b><p  class='font-mono text-xs'>{this.perspective.context.id}</p>
          <b class='font-medium'>owner</b><p  class='font-mono text-xs'>{this.perspective.creatorId}</p>
          <b class='font-medium'>head id</b><p  class='font-mono text-xs'>{this.perspective.head ? this.perspective.head.id : null}</p>
          <b class='font-medium'>data id</b><p  class='font-mono text-xs'>{this.perspective.head ? this.perspective.head.data.id : null}</p>
         
      </content>
      <h2 class='text-2xl m-2'>Other perspectives</h2>
      {this.contextPerspectives.filter(p => p.id != this.perspective.id).map(perspective => {
            return (<div class='otherPerspectives break-words font-mono text-xs py-2 border-b'>
                      <span class='ml-2'><b class='font-bold'>{perspective.name}</b> - {perspective.origin}- {perspective.creatorId}</span>
                      <span class='ml-2'>{perspective.id}</span>
                    </div>)
          })}
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputInfo.emit(false)}>Close</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

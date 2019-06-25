import { Component, State, Event, EventEmitter, Prop } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newPerspective } from './../../actions';
import { c1ServiceProvider, ethServiceProvider } from '../../services';


@Component({
  tag: 'co-input-new-perspective',
  styleUrl: 'co-input-new-perspective.scss',
  shadow: true
})
export class COInputNewPerspective {

  @Prop({ context: 'store' }) store: Store;
  @State() show: boolean = true
  @State() name: string
  @State() providerSelected: string
  @State() rootId: string;

  @Event({ eventName: 'showInputNewPerspective', bubbles: true }) showInputNewPerspective: EventEmitter

  handleMessage(event) {
    this.name = event.target.value
  }

  handleProviderSelected(event) {
    this.providerSelected = event.target.value
  }

  newPerspective: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newPerspective
    })

    this.store.mapStateToProps(this, (state) => {
      return {
        rootId: state.workpad.rootId
      }
    })
  }

  createNewPerspective() {
    this.newPerspective(this.rootId, this.name, this.providerSelected);
    this.showInputNewPerspective.emit(false)
  }


  renderInput() {
    return <div class='container m-4 w-1/2 h-1/2 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
      <h2 class='text-3xl m-2'>New Perspective</h2>
      <content>
        <input
          value={this.name}
          onChange={event => this.handleMessage(event)}
          class='ml-2 px-2 w-11/12 my-2 py-2 border-gray-600 border-b'
          placeholder='name (required)'>
        </input>

        <select onChange={event => this.handleProviderSelected(event)}>
          <option value={''}>Default</option>
          <option value={c1ServiceProvider}>CollectiveOne</option>
          <option value={ethServiceProvider}>ETH/IPFS</option>
        </select>

      </content>
      <footer class='flex text-red-700 justify-end'>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputNewPerspective.emit(false)}>Cancel</button>
        <button class='uppercase m-2 font-thin object-none ' onClick={() => this.createNewPerspective()}>Accept</button>
      </footer>
    </div>
  }

  render = () => this.renderInput()

}

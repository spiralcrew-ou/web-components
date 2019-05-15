import { Component, Prop, State } from '@stencil/core';
import { Store, Action } from '@stencil/redux';

const close = () => {
  return dispatch => {
    dispatch({ type: 'CLOSE_NEW_PERSPECTIVE' })
  }
}


@Component({
  tag: 'co-new-perspective',
  styleUrl: 'co-new-perspective.scss'
})
export class NewPerspective {

  @Prop({ context: 'store' }) store: Store
  @State() lastCall: string


  dispatchClose: Action

  componentWillLoad = () => {

    this.store.mapStateToProps(this, state => {
      return {
        lastCall: state.coLastCall.callData ? state.coLastCall.callData.callId  : ''
      }
    })
    
    this.store.mapDispatchToProps(this,{
      dispatchClose:  close
    })
  }


  render() {
    return <div>
      <button class="mdc-icon-button material-icons" onClick={this.dispatchClose}>close</button>
      <div class="content">
        <div class="mdc-text-field mdc-text-field--fullwidth">
          <input class="mdc-text-field__input"
            type="text"
            placeholder="add description here"
            aria-label="Full-Width Text Field" />
        </div>
      </div>
      <button class="mdc-fab mdc-fab--extended app-fab--absolute" onClick={this.dispatchClose}>
        <span class="material-icons mdc-fab__icon">add</span>
        <span class="mdc-fab__label">Create</span>
      </button>
    </div>;
  }
}

import { Component, Prop, Method } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { configureStore } from '../../store.js';
import {createIniciative, registerUser} from '../../actions.js';

@Component({
  tag: 'co-app',
  styleUrl: 'co-app.css',
  //shadow: true
})
export class COApp {

  @Prop({ context: 'store' }) store: Store;

  @Method()
  newIniciative(iniciative) {
    this.dispatchNewIniciative(iniciative,this.store.getState().loggedUser)
  }

  @Method()
  registerUser(user) {
    this.dispatchRegisterUser(user)
  }

  @Method()
  isAuthenticated() {
    return Object.keys(this.store.getState().loggedUser).length != 0
  }

  dispatchNewIniciative: Action 
  dispatchRegisterUser: Action

  componentWillLoad() {
    this.store.setStore(configureStore({}));

    this.store.mapStateToProps(this, (state) => {
      return {
        user: state.loggedUser
      }
    })

    this.store.mapDispatchToProps(this, {
      dispatchNewIniciative : createIniciative,
      dispatchRegisterUser : registerUser
    })
  }

  render() {
    return <slot />;
  }
}

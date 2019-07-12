import { Component, State, Listen, Method, Prop } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {
  c1ServiceProvider,
  ethServiceProvider,
  holochainServiceProvider
} from '../../services';
import { setEthAccount } from '../../actions';

import { configureStore } from '../../store';

@Component({
  tag: 'co-workspace-selector',
  styleUrl: 'co-workspace-selector.scss',
  shadow: true
})
export class COWorkspaceSelector {
  @Prop({ context: 'store' }) store: Store;
  @State() isStarting: boolean = true;
  @State() ethLoading: boolean = true;
  @State() defaultServiceProvider: string = c1ServiceProvider;

  setEthAccount: Action;

  selectorEnabled: boolean = false;

  availableServiceProviders: string[] = [
    c1ServiceProvider,
    ethServiceProvider,
    holochainServiceProvider
  ];

  @Listen('isStarting')
  handleLoding(event: CustomEvent) {
    this.isStarting = event.detail;
  }

  @Method()
  selectWorkspaceType(type: string): void {
    this.defaultServiceProvider = type;
    this.isStarting = true;
  }

  @Method()
  providerSelected(e: any) {
    this.selectWorkspaceType(e.target['selectedOptions'][0].value);
  }

  async componentWillLoad() {
    this.store.setStore(configureStore());

    this.store.mapDispatchToProps(this, {
      setEthAccount
    });

    console.log(
      `[WORSPACE SELECTOR] Avaliable services:`,
      this.availableServiceProviders
    );
    
    this.ethLoading = false;
  }

  renderWorkpad() {
    return (
      <div>
        {this.isStarting || this.ethLoading ? (
          <co-waiting-message class="center-loading" />
        ) : ''}
          <co-workspace
            class={this.isStarting || this.ethLoading ? 'hidden' : ''}
            default-service={this.defaultServiceProvider}
            avaialable-services={this.availableServiceProviders}
          />

      </div>
    );
  }

  renderWelcome() {
    return (
      <div>
        Please select a workspace type
        <select id="select-provider" onInput={e => this.providerSelected(e)}>
          <option>select provider</option>
          {this.availableServiceProviders.map(service => (
            <option value={service}>{service}</option>
          ))}
        </select>
      </div>
    );
  }

  render = () => {
    if (this.selectorEnabled) {
      return !this.defaultServiceProvider
        ? this.renderWelcome()
        : this.renderWorkpad();
    } else {
      return this.renderWorkpad();
    }
  };
}

import { Component, State, Listen, Method, Prop } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { c1ServiceProvider, ethServiceProvider, holochainServiceProvider } from '../../services';
import { setEthAccount } from '../../actions';

import { uprtclMultiplatform } from '../../services/index'
import { EthereumConnection } from '../../services/eth/eth.connection';

const ethConnection: EthereumConnection = uprtclMultiplatform.serviceProviders[ethServiceProvider].service['ethereum'];

@Component({
  tag: 'co-workspace-selector',
  styleUrl: 'co-workspace-selector.scss',
  shadow: true
})
export class COWorkspaceSelector {

  @Prop({ context: 'store' }) store: Store;
  @State() isStarting: boolean = true
  @State() ethLoading: boolean = true
  @State() defaultServiceProvider: string = ethServiceProvider;

  setEthAccount: Action

  selectorEnabled: boolean = false;

  availableServiceProviders: string[] = [
    c1ServiceProvider,
    ethServiceProvider,
    holochainServiceProvider
  ]

  @Listen('isStarting')
  handleLoding(event: CustomEvent) {
    this.isStarting = event.detail
    console.log(event.detail)
  }

  @Method()
  selectWorkspaceType(type: string): void {
    this.defaultServiceProvider = type
    this.isStarting = true
  }

  @Method()
  providerSelected(e: any) {
    this.selectWorkspaceType(e.target['selectedOptions'][0].value);
  }

  async componentWillLoad() {

    this.store.mapDispatchToProps(this, {
      setEthAccount
    })

    console.log(`[WORSPACE SELECTOR] Avaliable services:`, this.availableServiceProviders);
    await ethConnection.ready();
    console.log(`[WORSPACE SELECTOR] Ethereum ready`);
    setTimeout(() => {
      console.log(this.store)
      this.setEthAccount(ethConnection.account);
      this.ethLoading = false
    }, 2000)
    
  }

  renderWorkpad() {
    return <div class='waiting'>
      {(this.isStarting || this.ethLoading) ? 
        <co-waiting-message class="center-loading"></co-waiting-message>
        : <co-workspace
            default-service={this.defaultServiceProvider}
            avaialable-services={this.availableServiceProviders}>
          </co-workspace>}
      
    </div>
  }

  renderWelcome() {
    return <div>Please select a workspace type
            <select id="select-provider"
        onInput={e => this.providerSelected(e)}>
        <option>select provider</option>
        {this.availableServiceProviders.map(service => (
          <option value={service}>{service}</option>
        ))}
      </select>
    </div>
  }

  render = () => {
    if (this.selectorEnabled) {
      return !this.defaultServiceProvider ? this.renderWelcome() : this.renderWorkpad()
    } else {
      return this.renderWorkpad()
    }
  }
}


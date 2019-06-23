import { Component, State, Listen, Method } from '@stencil/core';
import { c1ServiceProvider, ethServiceProvider } from '../../services';

@Component({
    tag: 'co-workspace-selector',
    styleUrl: 'co-workspace-selector.scss',
    shadow: true
  })
  export class COWorkspaceSelector {

    @State() isStarting: boolean
    @State() defaultServiceProvider: string 
    @State() availableServiceProviders: string[] = [
        c1ServiceProvider,
        ethServiceProvider
    ]

    @Listen('isStarting')
    handleLoding(event:CustomEvent) {
        this.isStarting = event.detail
        console.log(event.detail)
    }

    @Method()
    selectWorkspaceType(type:string):void { 
        this.defaultServiceProvider=type
        this.isStarting = true
    }

    @Method()
    providerSelected(e: any) {
        this.selectWorkspaceType(e.target['selectedOptions'][0].value);
    }

    componentWillLoad() {
        console.log(`[WORSPACE SELECTOR] Avaliable services:`, this.availableServiceProviders);
    }

    renderWorkpad() {
        return <div>
        {this.isStarting ? <co-waiting-app></co-waiting-app> : ''}
        <co-workspace 
            default-service={this.defaultServiceProvider}
            avaialable-services={this.availableServiceProviders}>
        </co-workspace>
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

    render = () => !this.defaultServiceProvider ? this.renderWelcome() : this.renderWorkpad()
    
  }


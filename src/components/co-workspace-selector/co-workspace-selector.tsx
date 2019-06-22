import { Component, State, Listen } from '@stencil/core';
import { c1ServiceProvider as serviceProvider } from '../../services';
//import { ethServiceProvider as serviceProvider } from '../../services';


@Component({
    tag: 'co-workspace-selector',
    styleUrl: 'co-workspace-selector.scss',
    shadow: true
  })
  export class COWorkspaceSelector {

    @State() isStarting: boolean
    @State() defaultServiceProvider: string 

    @Listen('isStarting')
    handleLoding(event:CustomEvent) {
        this.isStarting = event.detail
        console.log(event.detail)
    }

    selectWorkspaceType(type:string):void { 
        this.defaultServiceProvider=type
        this.isStarting = true
    }

    componentWillLoad() {
        this.selectWorkspaceType(serviceProvider);
    }

    renderWorkpad() {
        return <div>
        {this.isStarting ? <co-waiting-app></co-waiting-app> : ''}
        <co-workspace default-service={this.defaultServiceProvider}></co-workspace>
    </div>
    }

    renderWelcome() {
        return <div>Please select a workspace type
            <button onClick={() => this.selectWorkspaceType(serviceProvider)}>{serviceProvider}</button>
        </div>
    }

    render = () => !this.defaultServiceProvider ? this.renderWelcome() : this.renderWorkpad()
    
  }


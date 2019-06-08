import {
  Component,
  Prop,
  Element,
  Event,
  EventEmitter,
  State
} from '@stencil/core';
import { Perspective } from '../../types';
import { uprtclData } from '../../services/uprtcl-data';
import { uprtclMultiplatform } from '../../services';

@Component({
  tag: 'uprtcl-toolbar',
  styleUrl: 'uprtcl-toolbar.scss',
  shadow: true
})
export class UptrclToolbar {
  @Element() private element: HTMLElement;

  @Prop() perspective: Perspective;
  @Prop() defaultService: string;

  @State() creatingPerspective: boolean = false;
  @State() contextPerspectives: Perspective[] = [];

  @Event({
    eventName: 'createCommit'
  })
  createCommit: EventEmitter<void>;

  @Event({
    eventName: 'selectPerspective'
  })
  selectPerspective: EventEmitter<string>;

  @Event({
    eventName: 'createPerspective'
  })
  createPerspectiveEvent: EventEmitter<{
    name: string;
    serviceProvider: string;
  }>;

  uprtcl = uprtclMultiplatform;

  async componentWillLoad() {
    this.contextPerspectives = await this.uprtcl.getContextPerspectives(
      this.perspective.contextId
    );
  }

  async logUprtcl () {
    const prettyString = await uprtclData.pretty(this.perspective.id);
    console.log(prettyString);
  }

  componentDidLoad() {
  }

  render() {
    return (
      <div class="flex-column">
        <div class="flex-row">
          <select
            disabled={ this.contextPerspectives.length === 0 }
            onChange={ (e: any) => { 
              this.selectPerspective.emit(
                e.target.selectedOptions[0].value 
              );              
            } }
          >
            {this.contextPerspectives.length === 0 ? (
              <option>Loading...</option>
            ) : (
              this.contextPerspectives.map(perspective => (
                <option value={perspective.id}>{perspective.name}</option>
              ))
            )}
          </select>
          <button onClick={() => (this.creatingPerspective = true)}>
            New Perspective
          </button>
          <button onClick={() => this.createCommit.emit()}>Commit</button>
          <button onClick={() => this.logUprtcl()}>Log</button>
        </div>
        {this.creatingPerspective ? (
          <div class="flex-row">
            <select id="new-perspective-provider">
              {this.uprtcl.getServiceProviders().map(service => (
                <option value={service}>{service}</option>
              ))}
            </select>
            <input id="new-perspective-name" type="text" />
            <button onClick={() => this.createPerspective()}>Create</button>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }

  createPerspective() {
    const name = this.element.shadowRoot.getElementById('new-perspective-name');
    const provider: any = this.element.shadowRoot.getElementById(
      'new-perspective-provider'
    );

    this.createPerspectiveEvent.emit({
      name: name['value'],
      serviceProvider: provider.selectedOptions[0].value
    });
    this.creatingPerspective = false;
  }
}

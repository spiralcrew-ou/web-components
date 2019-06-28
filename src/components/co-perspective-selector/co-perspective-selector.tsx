import { Component, Prop, Event, EventEmitter} from '@stencil/core';
import { Perspective } from '../../types';

@Component({
  tag: 'co-perspective-selector',
  styleUrl: 'co-perspective-selector.scss',
  shadow: true
})
export class COPerspectiveSelector {

  @Prop() perspectives: Perspective[];

  @Event({ eventName: 'perspectiveSelected', bubbles: true })
  perspectiveSelected: EventEmitter;
  
  componentWillLoad() {
  }

  perspectiveClicked(perspectiveId: string) {
    this.perspectiveSelected.emit(perspectiveId)
  }

  renderInput() {
    return <div class="row">
        {this.perspectives.map(perspective => { return (
          <div class="perspective-info">
            <co-perspective-info 
              onClick={() => this.perspectiveClicked(perspective.id)}
              perspective={perspective}>
            </co-perspective-info>
          </div>
        )})}
      </div>
  }

  render = () => this.renderInput()

}

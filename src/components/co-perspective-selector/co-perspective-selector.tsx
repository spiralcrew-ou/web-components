import { Component, Prop} from '@stencil/core';
import { Perspective } from '../../types';

@Component({
  tag: 'co-perspective-selector',
  styleUrl: 'co-perspective-selector.scss',
  shadow: true
})
export class COPerspectiveSelector {

  @Prop() perspectives: Perspective[];
  
  componentWillLoad() {
  }

  perspectiveSelected(perspectiveId: string) {
    console.log(perspectiveId);
  }

  renderInput() {
    return <div class="row">
        {this.perspectives.map(perspective => { return (
          <div class="perspective-info">
            <co-perspective-info 
              onClick={() => this.perspectiveSelected(perspective.id)}
              perspective={perspective}>
            </co-perspective-info>
          </div>
        )})}
      </div>
  }

  render = () => this.renderInput()

}

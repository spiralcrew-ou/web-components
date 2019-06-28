import { Component, Prop} from '@stencil/core';
import { Perspective } from '../../types';

@Component({
  tag: 'co-perspective-info',
  styleUrl: 'co-perspective-info.scss',
  shadow: true
})
export class COPerspectiveInfo {

  @Prop() perspective: Perspective;

  componentWillLoad() {
  }

  renderInput() {
    return <div class='container s-12 bg-gray-200'>
            <div class='row hash-id'>
              <b>id: </b>{this.perspective.id}
            </div>
            <div class='row hash-id'>
              <b>name: </b>{this.perspective.name}
            </div>
            <div class='row hash-id'>
              <b>origin: </b>{this.perspective.origin}
            </div>
            <div class='row hash-id'>
              <b>creatorId: </b>{this.perspective.creatorId}
            </div>
          </div>
  }

  render = () => this.renderInput()

}

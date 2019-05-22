import { Component, State } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { UprtclHolochain } from '../../services/holochain/uprtcl.holochain';

@Component({
  tag: 'uprtcl-root',
  styleUrl: 'uprtcl-root.scss',
  shadow: true
})
export class UprtclRoot {
  @State() rootPerspectiveId: string;

  @State() loading: boolean = true;
  uprtcl: UprtclService = new UprtclHolochain();

  componentWillLoad() {
    this.loading = true;
    this.uprtcl.getRootPerspective().then(perspective => {
      this.rootPerspectiveId = perspective.id;
      this.loading = false;
    });
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
          <uprtcl-perspective perspectiveId={this.rootPerspectiveId}>
            <slot />
          </uprtcl-perspective>
        )}
      </div>
    );
  }
}

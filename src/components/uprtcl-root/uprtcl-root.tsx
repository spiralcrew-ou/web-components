import { Component, State, Prop, Method } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { uprtclMultiplatform } from '../../services';

@Component({
  tag: 'uprtcl-root',
  styleUrl: 'uprtcl-root.scss',
  shadow: true
})
export class UprtclRoot {
  @Prop() providerSelected: string;
  @Prop() perspectiveId: string;
  @State() rootPerspectiveId: string;

  @State() loading: boolean = true;
  // Multiplatform service is already instantiated, get a reference to it
  uprtcl: UprtclService = uprtclMultiplatform;

  @Method()
  createRootElement() {
    this.uprtcl
      .createCommit(new Date().getTime(), 'Initial Commit', [], '123')
      .then(headId => {
        this.uprtcl.createContext(new Date().getTime(), 0).then(contextId => {
          this.uprtcl.createPerspective(
            contextId,
            'MyName',
            new Date().getTime(),
            headId
          );
        });
      });
  }

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

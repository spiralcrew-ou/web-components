import { Component, Prop, State, Watch, Element } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { Commit } from '../../types';
import { uprtclMultiplatform } from '../../services';

@Component({
  tag: 'uprtcl-commit',
  styleUrl: 'uprtcl-commit.scss',
  shadow: true
})
export class UprtclCommit {
  @Element() private element: HTMLElement;

  @Prop() commitId: string;
  @State() commit: Commit;

  @State() loading: boolean = true;

  // TODO: replace uprtcl with Redux appropiate calls
  // Also for now the component does not know which implementation of the UprtclService to use
  uprtcl: UprtclService = uprtclMultiplatform;

  loadCommit() {
    this.loading = true;
    this.uprtcl.getCommit(this.commitId).then(commit => {
      this.commit = commit;
      this.loading = false;
    });
  }

  componentWillLoad() {
    this.loadCommit();
  }

  @Watch('commitId')
  commitChanged() {
    this.loadCommit();
  }

  render() {
    // HELP: What to do when the component is loading?
    return <div>{this.loading ? <span>Loading...</span> : <slot />}</div>;
  }

  hostData() {
    if (this.commit && !this.loading) {
      // Not definetely sure about this, maybe we can access the HTML element
      // within the <slot> another way
      // This worked in my prototype at least :)
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['dataId'] = this.commit.dataId));
    }

    // HELP: Not sure what to return here
    return {};
  }
}

import {
  Component,
  Prop,
  Event,
  Element,
  EventEmitter,
  State,
  Watch,
  Listen
} from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { Perspective } from '../../types';
import { uprtclMultiplatform } from '../../services';

@Component({
  tag: 'uprtcl-perspective',
  styleUrl: 'uprtcl-perspective.scss',
  shadow: true
})
export class UprtclPerspective {
  @Element() private element: HTMLElement;

  @Prop() perspectiveId: string;

  @State() perspective: Perspective;

  @State() loading: boolean = true;

  @Event({
    bubbles: true, // Not sure if necessary
    composed: true, // At least necessary if we want to use shadowDom
    eventName: 'perspectiveCreated' // Not sure if should be perspective-created
  })
  perspectiveCreated: EventEmitter;

  // TODO: replace uprtcl with Redux appropiate calls
  // Also for now the component does not know which implementation of the UprtclService to use
  uprtcl: UprtclService = uprtclMultiplatform;

  loadPerspective() {
    // Perspective id can be null, in that case do nothing
    if (this.perspectiveId) {
      this.loading = true;
      this.uprtcl.getPerspective(this.perspectiveId).then(perspective => {
        this.perspective = perspective;
        this.loading = false;
      });
    }
  }

  componentWillLoad() {
    this.loadPerspective();
  }

  @Watch('perspectiveId')
  perspectiveChanged() {
    this.loadPerspective();
  }

  renderPerspective() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span> // What to do in the meantime the information is loading?
        ) : (
          <div>
            {this.perspective.headId ? (
              <uprtcl-commit commitId={this.perspective.headId}>
                <slot />
              </uprtcl-commit>
            ) : (
              <data-resolver perspectiveId={this.perspectiveId}>
                <slot />
              </data-resolver>
            )}
          </div>
        )}
      </div>
    );
  }

  // If perspective id is null, it means that a new context and perspective will be created
  // when content is saved, thus render the placeholder
  render() {
    return (
      <div>
        {this.perspectiveId ? (
          this.renderPerspective()
        ) : (
          // The perspective id is null and so this is a "placeholder" perspective
          <slot />
        )}
      </div>
    );
  }

  hostData() {
    if (!this.loading && this.perspective.headId) {
      /** Pass perspectiveId to data resolver.
       *  Dirty fix until we understand how to handle drafts management */
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['perspectiveId'] = this.perspectiveId));
    }

    // HELP: Not sure what to return here
    return {};
  }

  @Listen('commit-content')
  async commitContent(event: CustomEvent) {
    // Important in case other <uprtcl-perspectives> are above this one
    event.stopPropagation();

    if (this.perspectiveId) {
      // If this is an existing perspective, just create a commit
      this.createCommitInPerspective(event.detail.dataId);
    } else {
      // If this is a placeholder perspective, create a new context, perspective and commit
      this.createPerspectiveAndCommit(event.detail.dataId);
    }
  }

  async createCommitInPerspective(dataId: string) {
    // How to show the saving... state?
    const commitId = await this.uprtcl.createCommit(
      Date.now(),
      'Where to get the message from?',
      [this.perspective.headId],
      dataId
    );
    await this.uprtcl.updateHead(this.perspectiveId, commitId);
  }

  async createPerspectiveAndCommit(dataId: string) {
    const contextId = await this.uprtcl.createContext(Date.now(), 0);
    const commitId = await this.uprtcl.createCommit(
      Date.now(),
      'initial commit',
      [],
      dataId
    );
    const perspectiveId = await this.uprtcl.createPerspective(
      contextId,
      'master',
      Date.now(),
      commitId
    );

    this.perspectiveCreated.emit(perspectiveId);
  }
}

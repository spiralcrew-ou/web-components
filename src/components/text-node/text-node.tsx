import {
  Component,
  Prop,
  State,
  Listen,
  Watch,
  Event,
  EventEmitter
} from '@stencil/core';
import { TextNode, Perspective, Commit } from '../../types';
import { UprtclService } from '../../services/uprtcl.service';
import { uprtclMultiplatform, dataMultiplatform } from '../../services';

@Component({
  tag: 'text-node',
  styleUrl: 'text-node.scss',
  shadow: true
})
export class TextNodeElement {
  @Prop() perspectiveId: string;

  @State() perspective: Perspective;
  @State() commit: Commit;

  @State() node: TextNode;
  @State() draft: TextNode;

  @State() loading: boolean = true;

  // Necessary to add to diferentiate when to add a child node or when to emit createSibling event
  @Prop() isRootNode: boolean = true;

  @Event({
    eventName: 'createSibling'
  })
  createSibling: EventEmitter;

  uprtclService: UprtclService = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async loadPerspective() {
    this.perspective = await this.uprtclService.getPerspective(
      this.perspectiveId
    );

    // Head can be null, only go get it if it exists
    if (this.perspective.headId) {
      this.commit = await this.uprtclService.getCommit(this.perspective.headId);
      this.node = await this.dataService.getData(this.commit.dataId);
    }
  }

  @Watch('perspectiveId')
  async componentWillLoad() {
    this.loading = true;

    // We can load the perspective with its contents and its draft at the same time
    await Promise.all([
      this.loadPerspective(),
      this.dataService
        .getDraft(this.perspectiveId)
        .then(draft => (this.draft = draft))
    ]);

    this.loading = false;
  }

  getRenderingData() {
    // If draft is null, we can render the node directly
    return this.draft ? this.draft : this.node;
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
          <div class='node'>
            <text-block text={this.getRenderingData().text} />

            {this.getRenderingData().links.map(link => (
              <text-node
                isRootNode={false}
                perspectiveId={link.link}
                onCreateSibling={() => this.createNewChild()}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  newNode(): TextNode {
    return {
      text: '',
      links: []
    };
  }

  @Listen('keydown')
  async onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      // If this is the root node, add a new child, otherwise emit event for the parent to create a sibling
      if (this.isRootNode) {
        this.createNewChild();
      } else {
        this.createSibling.emit();
      }
    }
  }

  // Creates a new perspective and adds it to the current draft
  async createNewChild() {
    // Create new perspective
    const newPerspectiveId = await this.createNewPerspective();

    // Create a new draft to the said perspective
    await this.dataService.setDraft(newPerspectiveId, this.newNode());

    // Add a link to the new perspective to draft
    this.draft.links.push({ link: newPerspectiveId });
    await this.dataService.setDraft(this.perspectiveId, this.draft);
    this.draft = { ...this.draft };
  }

  @Listen('content-changed')
  contentChanged(event: CustomEvent) {
    event.stopPropagation();
    this.draft.text = event.detail;
    this.dataService.setDraft(this.perspectiveId, this.draft);
  }

  // Unused method for now, to be called when we want to commit to the current perspective
  async commitContent() {
    const dataId = await this.dataService.createData(this.draft);
    const parentsIds = this.perspective.headId ? [this.perspective.headId] : [];

    const commitId = await this.uprtclService.createCommit(
      Date.now(),
      'Commit at ' + Date.now(),
      parentsIds,
      dataId
    );
    await this.uprtclService.updateHead(this.perspectiveId, commitId);
  }

  // Creates a new context and perspective
  async createNewPerspective(): Promise<string> {
    const contextId = await this.uprtclService.createContext(Date.now(), 0);
    return await this.uprtclService.createPerspective(
      contextId,
      'master',
      Date.now(),
      null
    );
  }
}

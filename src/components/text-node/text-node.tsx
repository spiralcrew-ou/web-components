import {
  Component,
  Prop,
  State,
  Listen,
  Event,
  Element,
  EventEmitter,
  Method
} from '@stencil/core';
import { TextNode, Perspective, Commit } from '../../types';
import { uprtclMultiplatform, dataMultiplatform } from '../../services';
import { uprtclData } from '../../services/uprtcl-data';

@Component({
  tag: 'text-node',
  styleUrl: 'text-node.scss',
  shadow: true
})
export class TextNodeElement {
  @Element() private element: HTMLElement;

  @Prop({ mutable: true }) perspectiveId: string;
  @Prop() defaultService: string;

  @State() perspective: Perspective;
  @State() commit: Commit;

  @State() node: TextNode;
  @State() draft: TextNode;

  @State() loading: boolean = true;

  // Necessary to add to differentiate when to add a child node or when to emit createSibling event
  @Prop() isRootNode: boolean = true;

  @Event({
    eventName: 'createSibling'
  })
  createSibling: EventEmitter;

  uprtclService = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async loadPerspective() {
    this.perspective = await this.uprtclService.getPerspective(
      this.perspectiveId
    );

    this.draft = await this.dataService.getDraft(
      this.perspective.origin,
      this.perspectiveId
    );

    // Head can be null, only go get it if it exists
    if (this.perspective.headId) {
      this.commit = await this.uprtclService.getCommit(this.perspective.headId);
      this.node = await this.dataService.getData(this.commit.dataId);
    }
  }

  // TODO: fix bug when getting newly created commit and uncomment this:
  // @Watch('perspectiveId')
  async componentWillLoad() {
    this.loading = true;

    // We can load the perspective with its contents and its draft at the same time
    await this.loadPerspective(), (this.loading = false);
  }

  hasChanges() {
    if (!this.node) {
      return true;
    }

    if (this.draft != null) {
      let textEqual = this.node.text.localeCompare(this.draft.text) == 0;
      let linksEqual = this.node.links.length === this.draft.links.length;
      for (let i = 0; i < this.node.links.length; i++) {
        linksEqual =
          linksEqual &&
          this.node.links[i].link.localeCompare(this.draft.links[i].link) == 0;
        // TODO: compare position...
      }

      return !(textEqual && linksEqual);
    }

    return false;
  }

  getRenderingData() {
    // If draft is null, we can render the node directly
    return this.draft != null ? this.draft : this.node;
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
          <div class='flex-column'>
            {this.isRootNode ? (
              <uprtcl-toolbar
                defaultService={this.defaultService}
                perspective={this.perspective}
                onCreateCommit={() => this.createCommit()}
                onCreatePerspective={e =>
                  this.createPerspective(
                    e.detail.serviceProvider,
                    e.detail.name
                  )
                }
                onSelectPerspective={e => this.selectPerspective(e.detail)}
              />
            ) : (
              ''
            )}

            <div class='node'>
              <text-block
                id={this.perspectiveId}
                text={this.getRenderingData().text}
              />
              {this.hasChanges() ? <div class='indicator' /> : ''}

              {this.getRenderingData().links.map(link => (
                <text-node
                  id={this.perspectiveId}
                  class='child-node'
                  isRootNode={false}
                  perspectiveId={link.link}
                  onCreateSibling={() => this.createNewChild()}
                />
              ))}
            </div>
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

  selectPerspective(perspectiveId: string) {
    this.perspectiveId = perspectiveId;
    this.loadPerspective();
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

  @Method()
  public async createPerspective(serviceProvider: string, name: string) {
    // Create new perspective
    const newPerspectiveId = await uprtclData.createGlobalPerspective(
      serviceProvider,
      this.perspectiveId,
      name
    );

    this.perspectiveId = newPerspectiveId;
    await this.loadPerspective();
  }

  // Creates a new perspective and adds it to the current draft

  /** TODO: This is critical function, I suggest we move it to uprtclData
   * to have one place in which it is implemented. */ 

  async createNewChild() {
    // Create new perspective
    const newPerspectiveId = await this.createNewPerspective(
      this.perspective.origin,
      null
    );

    // Create a new draft to the said perspective
    await this.dataService.setDraft(
      this.perspective.origin,
      newPerspectiveId,
      this.newNode()
    );

    // Add a link to the new perspective to draft
    /** TODO: I am not sure but it seems that the draft should be referred to with a getter like
     * this.getDraft() that will create it if it is null, or return it if it exist. and a setter
     * that will persist it.
     *
     * This way the logic of the draft maintainance dont need to be handled by its users. */

    if (this.draft == null) this.draft = { ...this.node };
    this.draft.links.push({ link: newPerspectiveId });
    this.draft = { ...this.draft };
    await this.dataService.setDraft(
      this.perspective.origin,
      this.perspectiveId,
      this.draft
    );
  }

  @Listen('content-changed')
  contentChanged(event: CustomEvent) {
    event.stopPropagation();

    if (this.draft == null) this.draft = { ...this.node };
    this.draft.text = event.detail;
    this.draft = { ...this.draft };
    this.dataService.setDraft(
      this.perspective.origin,
      this.perspectiveId,
      this.draft
    );
  }

  @Method()
  public async createCommit() {
    /* TODO: recursivity is using the DOM links as the criteria for 
       for recursivity. It should is the object lins instead and 
       the DOM should react. */

    const nodes: Array<any> = Array.from(
      this.element.shadowRoot.querySelectorAll('.child-node')
    );
    return Promise.all([
      this.commitContent(),
      ...nodes.map(node => node.createCommit())
    ]);
  }

  private async commitContent() {
    const dataId = await this.dataService.createData(
      this.perspective.origin,
      this.draft
    );
    const parentsIds = this.perspective.headId ? [this.perspective.headId] : [];
    const commitId = await this.uprtclService.createCommit(
      this.perspective.origin,
      Date.now(),
      'Commit at ' + Date.now(),
      parentsIds,
      dataId
    );

    await this.uprtclService.updateHead(this.perspectiveId, commitId);
    await this.loadPerspective();
  }

  // Creates a new context (if contextId is null) and perspective
  async createNewPerspective(
    serviceProvider: string,
    contextId: string,
    name: string = 'master'
  ): Promise<string> {
    if (!contextId) {
      contextId = await this.uprtclService.createContext(
        serviceProvider,
        Date.now(),
        0
      );
    }
    return this.uprtclService.createPerspective(
      serviceProvider,
      contextId,
      name,
      Date.now(),
      null
    );
  }
}

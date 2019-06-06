import { Component, State, Element } from '@stencil/core';
import { uprtclMultiplatform, dataMultiplatform } from '../../services';
import { TextNode } from '../../types';

@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: true
})
export class CoEditor {
  @Element() private element: HTMLElement;

  @State() perspectiveId: string;
  @State() loading: boolean = true;
  @State() creatingPerspective: boolean = false;
  @State() defaultService = 'https://www.collectiveone.org/uprtcl/1';

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async createPerspectiveWithDraft(
    serviceProvider: string,
    contextId: string,
    data: TextNode): Promise<string> {

    if (contextId == null) {
      contextId = await this.uprtcl.createContext(serviceProvider, Date.now(), 0);
    }
    const perspectiveId = await this.uprtcl.createPerspective(
      serviceProvider,
      contextId,
      'default',
      Date.now(),
      null
    );
    // head commit is left as null, only draft data is created. head commit is created at first commit
    await this.dataService.setDraft(serviceProvider, perspectiveId, data);
    return perspectiveId;
  }

  async addLinkToPerspective(_link: string, perspectiveId: string) {
    let newDraft = await this.dataService.getDraft(this.defaultService, perspectiveId);
    if (!newDraft) {
      newDraft = { text: '', links: [] };
    }
    newDraft.links.push({ link: _link });
    await this.dataService.setDraft(this.defaultService, perspectiveId, newDraft);
  }

  async createPerspectiveWithDraftUnder(
    data: TextNode,
    parentId: string
  ): Promise<string> {
    const perspectiveId = await this.createPerspectiveWithDraft(this.defaultService, null, data);
    await this.addLinkToPerspective(perspectiveId, parentId);
    return perspectiveId;
  }

  async componentWillLoad() {
    this.loading = true;

    /** MVP assumes one root perspective per user in platform */
    const rootContextId = await this.uprtcl.getRootContextId(this.defaultService);
    const rootPerspectives = await this.uprtcl.getContextPerspectives(
      rootContextId
    );
    const rootPerspectiveId = rootPerspectives[0].id;

    const draft = await this.dataService.getDraft(this.defaultService, rootPerspectiveId);

    if (draft && draft.links.length > 0) {
      // MVP shows one document per user only
      this.perspectiveId = draft.links[0].link;
    } else {
      this.perspectiveId = await this.createPerspectiveWithDraftUnder(
        { text: '', links: [] },
        rootPerspectiveId
      );
    }

    this.loading = false;
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
            <div class="flex-column">
              <div class="flex-row">
                <select>
                  <option />
                </select>
                <button
                  class="perspective-button"
                  onClick={() => this.creatingPerspective = true}
                >
                  New Perspective
              </button>
                <button class="commit-button" onClick={() => this.createCommit()}>
                  Commit
              </button>
              </div>
              {this.creatingPerspective ? (
                <div class="flex-row">
                  <select id="new-perspective-provider">
                    {
                      this.uprtcl.getServiceProviders().map(service => (
                        <option value={service}>{service}</option>
                      ))
                    }
                  </select>
                  <input id="new-perspective-name" type="text" />
                  <button class="commit-button" onClick={() => this.createPerspective()}>
                    Create
              </button>
                </div>) : ""}
              <text-node id="root-node" perspectiveId={this.perspectiveId} />
            </div>
          )}
      </div>
    );
  }

  createPerspective() {
    const name = this.element.shadowRoot.getElementById('new-perspective-name');
    const provider: any = this.element.shadowRoot.getElementById('new-perspective-provider');
    const node: any = this.element.shadowRoot.getElementById('root-node');
    node.createPerspective(provider.selectedOptions[0].value, name['value']);

  }
  createCommit() {
    const node: any = this.element.shadowRoot.getElementById('root-node');
    node.createCommit();
  }
}

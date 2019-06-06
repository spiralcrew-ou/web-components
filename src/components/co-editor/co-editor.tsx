import { Component, State, Element } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
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

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl: UprtclService = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async createPerspectiveWithDraft(data: TextNode): Promise<string> {
    const contextId = await this.uprtcl.createContext(Date.now(), 0);
    const perspectiveId = await this.uprtcl.createPerspective(
      contextId,
      'default',
      Date.now(),
      null
    );
    // head commit is left as null, only draft data is created. head commit is created at first commit
    await this.dataService.setDraft(perspectiveId, data);
    return perspectiveId;
  }

  async addLinkToPerspective(_link: string, perspectiveId: string) {
    let newDraft = await this.dataService.getDraft(perspectiveId);
    if (!newDraft) {
      newDraft = { text: '', links: [] };
    }
    newDraft.links.push({ link: _link });
    await this.dataService.setDraft(perspectiveId, newDraft);
  }

  async createPerspectiveWithDraftUnder(
    data: TextNode,
    parentId: string
  ): Promise<string> {
    const perspectiveId = await this.createPerspectiveWithDraft(data);
    await this.addLinkToPerspective(perspectiveId, parentId);
    return perspectiveId;
  }

  async componentWillLoad() {
    this.loading = true;

    /** MVP assumes one root perspective per user in platform */
    const rootContextId = await this.uprtcl.getRootContextId();
    const rootPerspectives = await this.uprtcl.getContextPerspectives(
      rootContextId
    );
    const rootPerspectiveId = rootPerspectives[0].id;

    const draft = await this.dataService.getDraft(rootPerspectiveId);

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
                onClick={() => this.createPerspective()}
              >
                Commit
              </button>
              <button class="commit-button" onClick={() => this.createCommit()}>
                Commit
              </button>
            </div>
            <text-node id="root-node" perspectiveId={this.perspectiveId} />
          </div>
        )}
      </div>
    );
  }

  createPerspective() {}
  createCommit() {
    const node: any = this.element.shadowRoot.getElementById('root-node');
    node.createCommit();
  }
}

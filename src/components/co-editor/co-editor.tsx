import { Component, State, Method } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { DataService } from '../../services/data.service';
import { uprtclMultiplatform, dataMultiplatform } from '../../services';
import { TextNode } from '../../types';
import { DraftService } from '../../services/draft.service';
import { DraftLocal } from '../../services/local/draft.local';

@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: true
})
export class CoEditor {
  @State() perspectiveId: string;
  @State() loading: boolean = true;

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl: UprtclService = uprtclMultiplatform;
  dataService: DataService<TextNode> = dataMultiplatform;
  /** Drafts are managed by the local service only for the moment */
  draftService: DraftService<any> = new DraftLocal();

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

  async createPerspectiveWithDraft(data: TextNode): Promise<string> {
    const contextId = await this.uprtcl.createContext(Date.now(), 0);
    const perspectiveId = await this.uprtcl.createPerspective(
      contextId,
      'default',
      Date.now(),
      null
    );
    // head commit is left as null, only draft data is created. head commit is created at first commit
    await this.draftService.setDraft(perspectiveId, data);
    return perspectiveId;
  }

  async addLinkToPerspective(_link: string, perspectiveId: string) {
    let newDraft = await this.draftService.getDraft(perspectiveId);
    if (!newDraft) {
      newDraft = { text: '', links: [] };
    }
    newDraft.links.push({ link: _link });
    await this.draftService.setDraft(perspectiveId, newDraft);
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

    const draft = await this.draftService.getDraft(rootPerspectiveId);

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
          <uprtcl-perspective perspectiveId={this.perspectiveId}>
            <data-resolver>
              <text-node />
            </data-resolver>
          </uprtcl-perspective>
        )}
      </div>
    );
  }
}

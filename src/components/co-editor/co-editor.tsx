import { Component, State } from '@stencil/core';
import {
  uprtclMultiplatform,
  dataMultiplatform,
  c1ServiceProvider,
} from '../../services';
import { TextNode } from '../../types';

@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: true
})
export class CoEditor {
  @State() perspectiveId: string;
  @State() loading: boolean = true;
  @State() defaultService = c1ServiceProvider;

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async createPerspectiveWithDraft(
    serviceProvider: string,
    contextId: string,
    data: TextNode
  ): Promise<string> {
    if (contextId == null) {
      contextId = await this.uprtcl.createContext(
        serviceProvider,
        Date.now(),
        0
      );
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
    let newDraft = await this.dataService.getDraft(
      this.defaultService,
      perspectiveId
    );
    if (!newDraft) {
      newDraft = { text: '', links: [] };
    }
    newDraft.links.push({ link: _link });
    await this.dataService.setDraft(
      this.defaultService,
      perspectiveId,
      newDraft
    );
  }

  async createPerspectiveWithDraftUnder(
    data: TextNode,
    parentId: string
  ): Promise<string> {
    const perspectiveId = await this.createPerspectiveWithDraft(
      this.defaultService,
      null,
      data
    );
    await this.addLinkToPerspective(perspectiveId, parentId);
    return perspectiveId;
  }

  async componentWillLoad() {
    this.loading = true;

    /** MVP assumes one root perspective per user in platform */
    const rootContextId = await this.uprtcl.getRootContextId(
      this.defaultService
    );
    const rootPerspectives = await this.uprtcl.getContextPerspectives(
      rootContextId
    );
    const rootPerspectiveId = rootPerspectives[0].id;

    const draft = await this.dataService.getDraft(
      this.defaultService,
      rootPerspectiveId
    );

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
          <text-node perspectiveId={this.perspectiveId} />
        )}
      </div>
    );
  }
}

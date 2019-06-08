import { Component, State } from '@stencil/core';
import {
  uprtclMultiplatform,
  dataMultiplatform,
  c1ServiceProvider as serviceProvider
} from '../../services';
import { uprtclData } from '../../services/uprtcl-data';
import { TextNode } from '../../types';

@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: true
})
export class CoEditor {
  @State() rootPerspectiveId: string;
  @State() perspectiveId: string;
  @State() loading: boolean = true;
  @State() defaultService = serviceProvider;

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl = uprtclMultiplatform;
  dataService = dataMultiplatform;

  async componentWillLoad() {
    this.loading = true;

    /** MVP assumes one root perspective per user in platform */
    const rootContextId = await this.uprtcl.getRootContextId(
      this.defaultService
    );
    const rootPerspectives = await this.uprtcl.getContextPerspectives(
      rootContextId
    );
    this.rootPerspectiveId = rootPerspectives[0].id;

    const draft = await this.dataService.getDraft(
      this.defaultService,
      this.rootPerspectiveId
    );

    if (draft && draft.links.length > 0) {
      // MVP shows one document per user only
      this.perspectiveId = draft.links[0].link;
    } else {
      this.perspectiveId = await this.createPerspectiveWithDraftUnder(
        { text: '', links: [] },
        this.rootPerspectiveId
      );
    }

    this.loading = false;
  }

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

  async logUprtcl () {
    const perspectiveFull = await uprtclData.getPerspectiveFull(this.rootPerspectiveId);
    console.log(perspectiveFull);
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
          <div>
            <button onClick={() => this.logUprtcl()}>Log</button>
            <text-node 
            id={this.perspectiveId} 
            perspectiveId={this.perspectiveId} 
            defaultService={this.defaultService}/>
          </div>
        )}
      </div>
    );
  }
}

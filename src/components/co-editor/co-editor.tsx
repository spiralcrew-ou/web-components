import { Component, State } from '@stencil/core';
import {
  uprtclMultiplatform,
  dataMultiplatform,
  // c1ServiceProvider as serviceProvider,
  ethServiceProvider as serviceProvider
  // localServiceProvider as serviceProvider
} from '../../services';
import { uprtclData } from '../../services/uprtcl-data';
import { TextNode, Context, Perspective } from '../../types';

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
    
    debugger

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
        { text: '', type: 'paragraph', links: [] },
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
      const context: Context = {
        creatorId: 'anon',
        timestamp: Date.now(),
        nonce: 0
      };
      contextId = await this.uprtcl.createContext(serviceProvider, context);
    }
    const perspective: Perspective = {
      creatorId: 'anon',
      contextId: contextId,
      name: 'default',
      origin: serviceProvider,
      timestamp: Date.now()
    };
    const perspectiveId = await this.uprtcl.createPerspective(
      serviceProvider,
      perspective
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
      newDraft = { text: '', type: 'paragraph', links: [] };
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

  async logUprtcl() {
    const perspectiveFull = await uprtclData.getPerspectiveFull(
      this.rootPerspectiveId,
      10
    );
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
              defaultService={this.defaultService}
            />
          </div>
        )}
      </div>
    );
  }
}

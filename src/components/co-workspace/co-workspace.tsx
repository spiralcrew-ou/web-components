import { Component, State, Prop } from '@stencil/core';
import {
  uprtclMultiplatform
} from '../../services';
import { Store, Action } from '@stencil/redux';
import { configureStore } from '../../store.js';
import { UprtclData } from '../../services/uprtcl-data';
import {setSelectedProvider} from '../../actions';

@Component({
  tag: 'co-workspace',
  styleUrl: 'co-workspace.scss',
  shadow: true
})
export class COWorkspace {
  @State() rootPerspectiveId: string;
  @State() documentPerspectiveId: string;
  //@State() defaultService = serviceProvider;
  @Prop() defaultService: string;
  @Prop({ context: 'store' }) store: Store;

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl = uprtclMultiplatform;
  uprtclData = new UprtclData();

  setSelectedProvider: Action

  constructor(_defaultServiceId: string) {
    this.defaultService = _defaultServiceId;
  }

  async checkInitDocAndParagraph(rootPerspectiveId: string): Promise<string> {
    /** rootPerspective draft is forced to have one single link pointing 
     * to the single document perspective */

    let documentPerspectiveId: string;

    /** get or create draft */
    let draft = await this.uprtclData.getOrCreateDraft(rootPerspectiveId);

    if (draft.links.length === 0) {
      documentPerspectiveId = 
        await this.uprtclData.initContextUnder(
          this.defaultService, this.rootPerspectiveId, -1, 'Untitled Document');
    } else {
      documentPerspectiveId = draft.links[0].link;
    }
      
    /** document is forced to have one empty paragraph */
    let document = await this.uprtclData.getPerspectiveFull(
      documentPerspectiveId, 1);

    if (document.draft.links.length === 0) {
      await this.uprtclData.initContextUnder(
        this.defaultService, documentPerspectiveId, -1, '');
    }

    /** no commits are done. So everything is a draft */
    return documentPerspectiveId;
  }

  async componentWillLoad() {
    this.store.setStore(configureStore());
    this.store.mapDispatchToProps(this, {
      setSelectedProvider,
    })


    await this.setSelectedProvider(this.defaultService)

    /**TODO: Pepo, here you got perspectiveId parameter if you want to browse an perspective
     * 
     *  new URLSearchParams(window.location.search).get("pid")
     */

    const rootContextId = await this.uprtcl.getRootContextId(
      this.defaultService
    );
    const rootPerspectives = await this.uprtcl.getContextPerspectives(
      rootContextId
    );

    if (rootPerspectives.length == 0) {
      this.rootPerspectiveId = await this.uprtclData.initPerspective(
        this.defaultService,
        rootContextId,
        'root context autogenerated perspective'
      );
    } else {
      this.rootPerspectiveId = rootPerspectives[0].id;
    }
    this.documentPerspectiveId = await this.checkInitDocAndParagraph(this.rootPerspectiveId)
  }

  render() {
    return (
      <div>
        <co-workpad document-id={this.documentPerspectiveId} />
      </div>
    );
  }
}

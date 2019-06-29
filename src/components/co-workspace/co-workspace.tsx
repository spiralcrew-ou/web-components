import { Component, State, Prop } from '@stencil/core';
import {
  uprtclMultiplatform
} from '../../services';
import { Store, Action } from '@stencil/redux';
import { configureStore } from '../../store.js';
import { uprtclData } from '../../services/uprtcl-data';
import {setSelectedProvider,initTree,reloadTree, NodeType, watchTasks} from '../../actions';

const enableInit = false;
const defaultPerspective = 'zb2rhbyDC8ZnYnmSNNYHzbmGrmFVFn91qsETDH1pdwhDLXPSw';

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
  uprtclData = uprtclData;

  watchTasks: Action
  setSelectedProvider: Action
  initTree: Action
  reloadTree: Action

  constructor(_defaultServiceId: string) {
    this.defaultService = _defaultServiceId;
  }

  async initDocument (perspectiveId) {
    console.log('[WORKSPACE] creating a document' )
    /** init an empty document as subcontext of the root perspective */
    await this.uprtclData.initContextUnder(
      this.defaultService, perspectiveId, -1, '', NodeType.title);

    /** commit this change to the root perspective */
    await this.uprtclData.commit(
      this.defaultService,
      perspectiveId,
      'auto commit link to new document');
  }

  async componentWillLoad() {
    this.store.setStore(configureStore());
    this.store.mapDispatchToProps(this, {
      watchTasks,
      setSelectedProvider,
      initTree,
      reloadTree,
    })
  }
  async componentDidLoad() {
    this.watchTasks();
    await this.setSelectedProvider(this.defaultService)
    
    let pid = new URLSearchParams(window.location.search).get("pid")
    
    if (!pid) {
      if (enableInit) {
        console.log('[WORKSPACE] setting up default doc' )
        const rootContextId = await this.uprtcl.getRootContextId(
          this.defaultService
        );
        const rootPerspectives = await this.uprtcl.getContextPerspectives(
          rootContextId
        );
  
        if (rootPerspectives.length == 0) {
          /** init perspective on perspective in the root context (root perspective) */
          console.log('[WORKSPACE] creating a root perspective' )
          this.rootPerspectiveId = await this.uprtclData.initPerspective(
            this.defaultService,
            rootContextId,
            'root context autogenerated perspective',
            NodeType.title
          );
  
          await this.initDocument(this.rootPerspectiveId);
        } else {
          this.rootPerspectiveId = rootPerspectives[0].id;
        }
  
        /** find document (should have been commited) */
        let rootPerspective = await this.uprtclData.getPerspectiveFull(this.rootPerspectiveId, 1);
  
        /** there should be a head, but maybe something went wrong. */
        if (!rootPerspective.head) {
          await this.initDocument(this.rootPerspectiveId);
        }
  
        rootPerspective = await this.uprtclData.getPerspectiveFull(this.rootPerspectiveId, 1);
        
        this.documentPerspectiveId = rootPerspective.head.data.links[0].link.id;
  
        /** check the document has a draft with one paragraph */
        let draft = await this.uprtclData.getOrCreateDraft(this.documentPerspectiveId);
        if (draft.links.length === 0) {
          await this.uprtclData.initContextUnder(
            this.defaultService, this.documentPerspectiveId, -1, '', NodeType.paragraph);
        }
      } else {
        console.log('[WORKSPACE] using default doc id' )
        window.location.href = `./?pid=${defaultPerspective}`
      }
    } else {
      console.log(`[WORKSPACE] PID found. Going to document ${pid}`)
      this.documentPerspectiveId = pid;
    }

    await this.initTree(this.documentPerspectiveId);
    await this.reloadTree();
  }

  render() {
    return (
      <div>
        <co-workpad document-id={this.documentPerspectiveId} />
      </div>
    );
  }
}

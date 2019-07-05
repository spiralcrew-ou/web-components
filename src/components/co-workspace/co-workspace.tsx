import { Component, State, Prop } from '@stencil/core';
import {
  uprtclMultiplatform
} from '../../services';
import { Store, Action } from '@stencil/redux';
import { uprtclData } from '../../services/uprtcl-data';
import {initTree,reloadTree, NodeType, watchTasks} from '../../actions';

const enableInit = true;
const defaultPerspective = 'zb2rhjak9Ejm3cMjFhz8Gi5ME933N5jV5txRAZmS6vJJzATgR';

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
  initTree: Action
  reloadTree: Action

  constructor(_defaultServiceId: string) {
    this.defaultService = _defaultServiceId;
  }

  async initDocument () {
    console.log('[WORKSPACE] creating a document' )
    /** init an empty document as subcontext of the root perspective */
    const documentId = await this.uprtclData.initContext(
      this.defaultService, '', NodeType.title);

      /** init an empty document as subcontext of the root perspective */
    await this.uprtclData.initContextUnder (
      this.defaultService, documentId, -1, '', NodeType.paragraph);

    return documentId;
  }

  async componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      watchTasks,
      initTree,
      reloadTree,
    })
  }
  async componentDidLoad() {
    this.watchTasks();
    
    let pid = new URLSearchParams(window.location.search).get("pid")
    
    if (!pid) {
      if (enableInit) {
        console.log('[WORKSPACE] creating a new document' )
        let documentId = await this.initDocument();
        
        console.log('[WORKSPACE] using default doc id' )
        window.location.href = `./?pid=${documentId}`
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

import { Component, State, Prop } from '@stencil/core';
import {
  uprtclMultiplatform,
  //c1ServiceProvider as serviceProvider,
  localServiceProvider as serviceProvider
} from '../../services';
import { Store } from '@stencil/redux';
import {configureStore} from '../../store.js';
import {UprtclData} from '../../services/uprtcl-data';

@Component({
  tag: 'co-workspace',
  styleUrl: 'co-workspace.scss',
  shadow: true
})
export class COWorkspace {
  @State() rootPerspectiveId: string;
  @State() documentPerspectiveId: string;
  @State() defaultService = serviceProvider;
  @Prop({ context: 'store' }) store: Store;

  // Multiplatform service is already instantiated, get a reference to it
  uprtcl = uprtclMultiplatform;
  uprtclData = new UprtclData()

  async componentWillLoad() {
    this.store.setStore(configureStore());
    const rootContextId = await this.uprtcl.getRootContextId(
      this.defaultService
    );
    const rootPerspectives = await this.uprtcl.getContextPerspectives(
      rootContextId
    );

    /**  */
    this.rootPerspectiveId = rootPerspectives[0].id;

    let fullPerspective = await this.uprtclData.getPerspectiveFull(rootPerspectives[0].id, 1);
    
    // Asume that is first load
    if (!fullPerspective.head && !fullPerspective.draft){
      this.documentPerspectiveId = await this.uprtclData.initContextUnder(serviceProvider,rootPerspectives[0].id, -1, '');
      await this.uprtclData.initContextUnder(serviceProvider, this.documentPerspectiveId, -1, 'first node');
    } else {
      this.documentPerspectiveId = fullPerspective.draft.links[0].link.id;
    }
    
    console.log(await this.uprtclData.getPerspectiveFull(this.documentPerspectiveId, -1))
  }

  render() {
    return (<div>
      <c1-workpad document-id={this.documentPerspectiveId}></c1-workpad>
    </div>)
    
  }
}

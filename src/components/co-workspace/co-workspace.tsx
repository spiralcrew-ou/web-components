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
    this.rootPerspectiveId = rootPerspectives[0].id;

    let fullPerspective = await this.uprtclData.getPerspectiveFull(rootPerspectives[0].id,-1)
    // Asume that is first load
    if (!fullPerspective.head && !fullPerspective.draft){
      await this.uprtclData.initContextUnder(serviceProvider,rootPerspectives[0].id,-1,'First node')
    } 
    
    console.log(await this.uprtclData.getPerspectiveFull(rootPerspectives[0].id,-1))
  }

  render() {
    return (<div>
      <c1-workpad document-id={this.rootPerspectiveId}></c1-workpad>
    </div>)
    
  }
}

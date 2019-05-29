import { Component, State, Method } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { DataService } from '../../services/data.service';
import { uprtclMultiplatform, dataMultiplatform } from '../../services';
import { TextNode } from '../../types';

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
  data: DataService<TextNode> = dataMultiplatform;

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

  async getPerspectiveWorkingData(perspectiveId: string) {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const commit = await this.uprtcl.getCommit(perspective.headId);
    return await this.data.getWorkingData(commit.dataId);
  }

  async componentWillLoad() {
    this.loading = true;
    const id = await this.uprtcl.getRootPerspectiveId();
    const workingData = await this.getPerspectiveWorkingData(id);

    // MVP shows one document per user only
    this.perspectiveId = workingData.draft.links[0].link;

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
              <text-node></text-node>
            </data-resolver>
          </uprtcl-perspective>
        )}
      </div>
    );
  }
}

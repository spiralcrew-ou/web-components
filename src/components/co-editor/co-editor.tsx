import { Component, State, Method } from '@stencil/core';
import { UprtclService } from '../../services/uprtcl.service';
import { DataService, WorkingData } from '../../services/data.service';
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
  dataService: DataService<TextNode> = dataMultiplatform;

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

  async getPerspectiveWorkingData(perspectiveId: string) : Promise<WorkingData<TextNode>> {
    const perspective = await this.uprtcl.getPerspective(perspectiveId);
    const commit = await this.uprtcl.getCommit(perspective.headId);
    return await this.dataService.getWorkingData(commit.dataId);
  }

  async createPerspectiveWithWorkingData(data: TextNode) : Promise<string> {
    const contextId = await this.uprtcl.createContext(Date.now(), 0);
    const perspectiveId = await this.uprtcl.createPerspective(contextId, "default", Date.now(), null);
    // head commit is left as null, only draft data is created. head commit is created at first commit
    await this.dataService.updateDraft(perspectiveId, data);
    return perspectiveId
  }

  async addLinkToPerspective(_link: string, perspectiveId: string) {
    const workingData = await this.getPerspectiveWorkingData(perspectiveId);
    const newDraft = workingData.draft;
    newDraft.links.push({link: _link});
    await this.dataService.updateDraft(perspectiveId, newDraft)
  }

  async createPerspectiveWithWorkingDataUnder(data: TextNode, parentId: string) : Promise<string> {
    const perspectiveId = await this.createPerspectiveWithWorkingData(data);
    await this.addLinkToPerspective(perspectiveId, parentId);
    return perspectiveId;
  }

  async componentWillLoad() {
    this.loading = true;
    
    /** MVP assumes one root perspective per user in platform */
    const rootContextId = await this.uprtcl.getRootContextId();
    const rootPerspectives = await this.uprtcl.getContextPerspectives(rootContextId);
    const rootPerspectiveId = rootPerspectives[0].id;
    const workingData = await this.getPerspectiveWorkingData(rootPerspectiveId);

    if (workingData.draft.links.length > 0) {
      // MVP shows one document per user only
      this.perspectiveId = workingData.draft.links[0].link;
    } else {
      this.perspectiveId = await this.createPerspectiveWithWorkingDataUnder({text: "", links: []}, rootPerspectiveId);
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
              <text-node></text-node>
            </data-resolver>
          </uprtcl-perspective>
        )}
      </div>
    );
  }
}

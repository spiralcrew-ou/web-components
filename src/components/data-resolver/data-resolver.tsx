import {
  Component,
  Prop,
  State,
  Watch,
  Element
} from '@stencil/core';

import { DataService } from '../../services/data.service';
import { DraftService } from '../../services/draft.service';
import { DraftLocal } from '../../services/local/draft.local';
import { dataMultiplatform } from '../../services';

@Component({
  tag: 'data-resolver',
  shadow: true
})
export class DataResolver {
  @Element() private element: HTMLElement;

  @Prop() perspectiveId: string;
  @Prop() dataId: string;
  @Prop() draft: any;
  
  @State() loading: boolean = true;
  @State() data: any;
  
  dataService: DataService<any> = dataMultiplatform;
  
  /** Drafts are managed by the local service only for the moment */
  draftService: DraftService<any> = new DraftLocal();

  async loadData() {
    if (this.dataId) {
      this.loading = true;
      this.data = await this.dataService.getData(this.dataId);
      this.draft = await this.draftService.getDraft(this.perspectiveId);

      this.loading = false;
    }
  }

  componentWillLoad() {
    this.loadData();
  }

  @Watch('dataId')
  dataChanged() {
    this.loadData();
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
            <slot></slot>
          )}
      </div>
    );
  }

  hostData() {
    if (this.data && !this.loading) {
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['data'] = this.data));

      // TODO... check if draft and data can be set at once.
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['draft'] = this.draft));
    }

    return {};
  }
}

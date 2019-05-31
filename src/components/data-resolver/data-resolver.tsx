import { Component, Prop, State, Watch, Element } from '@stencil/core';

import { DataService } from '../../services/data.service';
import { DraftService } from '../../services/draft.service';
import { dataMultiplatform } from '../../services';
import { DraftLocal } from '../../services/local/draft.local';

@Component({
  tag: 'data-resolver',
  shadow: true
})
export class DataResolver {
  @Element() private element: HTMLElement;

  @Prop() perspectiveId: string;
  @Prop() dataId: string;
  @State() draft: any;

  @State() loading: boolean = true;
  @State() data: any;

  dataService: DataService<any> = dataMultiplatform;

  /** Drafts are managed by the local service only for the moment */
  draftService: DraftService<any> = new DraftLocal();

  async loadData() {
    this.loading = true;
    if (this.dataId) {
      this.data = await this.dataService.getData(this.dataId);
    } else if (this.perspectiveId) {
      this.draft = await this.draftService.getDraft(this.perspectiveId);
    }
    this.loading = false;
  }

  componentWillLoad() {
    this.loadData();
  }

  @Watch('dataId')
  dataChanged() {
    this.loadData();
  }

  render() {
    return <div>{this.loading ? <span>Loading...</span> : <slot />}</div>;
  }

  hostData() {
    if (this.draft && !this.loading) {
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['data'] = this.draft));
    } else if (this.data && !this.loading) {
      // TODO... check if draft and data can be set at once.
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['data'] = this.data));
    }

    return {};
  }
}

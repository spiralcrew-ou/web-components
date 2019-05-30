import {
  Component,
  Prop,
  State,
  Watch,
  Element
} from '@stencil/core';

import { DataService } from '../../services/data.service';
import { dataMultiplatform } from '../../services';

@Component({
  tag: 'data-resolver',
  shadow: true
})
export class DataResolver {
  @Element() private element: HTMLElement;

  @Prop() dataId: string;
  @State() loading: boolean = true;
  @State() workingData: any;
  
  dataService: DataService<any> = dataMultiplatform;

  async loadData() {
    if (this.dataId) {
      this.loading = true;
      this.workingData = await this.dataService.getWorkingData(this.dataId);

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
    if (this.workingData && !this.loading) {
      this.element
        .querySelector('slot')
        .assignedNodes({ flatten: true })
        .filter(node => node.nodeType === 1)
        .forEach(e => (e['data'] = this.workingData.draft));
    }

    return {};
  }
}

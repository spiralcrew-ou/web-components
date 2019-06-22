import {
  Component
} from '@stencil/core';

@Component({
    tag: 'co-loading',
    styleUrl: 'co-loading.scss',
    shadow: true
  })
  export class COLoading {

    render() {
      return<div>Loading...</div>
    }
  }

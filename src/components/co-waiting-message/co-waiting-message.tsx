import { Component } from '@stencil/core';

@Component({
  tag: 'co-waiting-message',
  styleUrl: 'co-waiting-message.scss',
  shadow: true
})
export class COWaitingMessage {
  render() {
    return (
      <div class="container ">
        <div class="title text-center w-64 text-thin text-gray-700 h-full w-full">
          <co-waiting-app class="loading" />
        </div>
      </div>
    );
  }
}

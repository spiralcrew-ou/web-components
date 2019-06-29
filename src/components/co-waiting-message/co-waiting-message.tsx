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
          Please check you are using HTTPS and <b>not</b> http://demo.uprtcl.io
          and you have a web3 provider connected to the Rinkeby Ethereum Testnet
          <co-waiting-app class="loading" />
        </div>
      </div>
    );
  }
}

import Web3 from 'web3';
import * as UprtclContractArtifact from './Uprtcl.json';

const web3 = window['web3'];
const ethereum = window['ethereum'];

const getProvider = (host: string) => {
  let web3Provider = null;
  if (ethereum) {
    web3Provider = ethereum;
    try { ethereum.enable(); } catch (error) {
      console.error("User denied account access")
    }
  } else if (web3) {
    web3Provider = new Web3(web3.currentProvider);
  } else {
    web3Provider = new Web3(new Web3.providers.HttpProvider(host));
  }
  return web3Provider;
}

export class EthereumConnection {
  web3: any;
  uprtclInstance: any;
  connectionReady: Promise<any>;

  constructor(host: string) {
    this.web3 = getProvider(host);
    let contract = this.web3.eth.contract(UprtclContractArtifact.abi);
    this.uprtclInstance = contract.at(UprtclContractArtifact.networks['5777'].address);
  }

}

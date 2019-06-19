const w3w = window['w3w'];
import * as UprtclContractArtifact from './Uprtcl.json';

export class EthereumConnection {
  web3: any;
  uprtclInstance: any;
  connectionReady: Promise<any>;
  account: string;

  constructor(host: string) {
    this.connectionReady = new Promise((resolve) => {
      w3w.initializeWeb3({
        localProvider: host,
        handlers: {
          web3Ready: () => {
            this.web3 = w3w.getWeb3js()
            this.account = w3w.getAccount();
            this.uprtclInstance = new this.web3.eth.Contract(
              UprtclContractArtifact.abi,
              UprtclContractArtifact.networks[w3w.getNetworkId()].address);
            resolve()
          }
        }
      })
    })
  }

  public ready(): Promise<void> {
    if (this.uprtclInstance) return Promise.resolve();
    else return this.connectionReady;
  }
}

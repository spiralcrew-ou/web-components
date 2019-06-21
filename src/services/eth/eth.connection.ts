import * as UprtclContractArtifact from './Uprtcl.json';

export class EthereumConnection {
  web3: any;
  uprtclInstance: any;
  connectionReady: Promise<any>;
  account: string;

  constructor(host: string) {
    this.connectionReady = new Promise((resolve) => {
      let interval = setInterval(() => {
        let w3w = window['w3w']
        console.log('[ETH] Waiting for client injection')
        if (w3w) {
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
          clearInterval(interval)
        }
      }, 200)
    })
  }

  public ready(): Promise<void> {
    if (this.uprtclInstance) return Promise.resolve();
    else return this.connectionReady;
  }

  /** a function to call a method and resolve only when confirmed */
  public send(funcName: string, pars: any[]): Promise<any> {
    return new Promise(async resolve => {
      
      let gasEstimated = await this.uprtclInstance.methods[funcName](...pars).estimateGas()
      
      this.uprtclInstance.methods[funcName](...pars)
      .send({ 
        from: this.account,
        gas: Math.ceil(gasEstimated * 1.1)
      })
      .once('transactionHash', (transactionHash) => {
        console.log(`[ETH] TX HASH ${funcName} `, { transactionHash, pars });
      })
      .on('receipt', (receipt) => {
        console.log(`[ETH] RECEIPT ${funcName} receipt`, { receipt, pars });
      })
      .on('error', (error) => {
        console.error(`[ETH] ERROR ${funcName} `, { error, pars });
      })
      .on('confirmation', (confirmationNumber) => {
        console.log(`[ETH] CONFIRMED ${funcName}`, { confirmationNumber, pars });
      })
      .then((receipt: any) => {
        console.log(`[ETH] MINED ${funcName} call mined`, { pars, receipt });
        resolve();
      })
    });
  }

  public call(funcName: string, pars: any[]): Promise<any> {
    return this.uprtclInstance.methods[funcName](...pars)
      .call({ from: this.account });
  }
}

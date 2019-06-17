import { UprtclService } from '../uprtcl.service';
import { Context, Commit, Perspective } from './../../objects';

import { IpfsStub } from './ipfs.data.stub';

import multihashing from 'multihashing-async';
import Buffer from 'buffer/';

import Web3 from 'web3';
import * as UprtclContractArtifact from './Uprtcl.json';
import contract from 'truffle-contract';

const userId = 'did:sec256k1:mykey';
const web3 = window['web3'];
const ethereum = window['ethereum'];

const getProvider = (host: string) => {
  let web3Provider = null;
  if (ethereum) {
    web3Provider = ethereum;
    try {
      // Request account access
      ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error('User denied account access');
    }
  }
  // Legacy dapp browsers...
  else if (web3) {
    web3Provider = new Web3(web3.currentProvider);
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    web3Provider = new Web3(new Web3.providers.HttpProvider(host));
  }
  return web3Provider;
};

export class UprtclEthereum implements UprtclService {
  ipfsClient = null;
  web3 = null;
  UprtclContract = null;
  uprtclInstance = null;
  loggedAccount = null;
  accounts = [];

  constructor(host: string) {
    this.ipfsClient = new IpfsStub();
    this.web3 = getProvider(host);
    this.UprtclContract = contract(UprtclContractArtifact);
    this.UprtclContract.setProvider(this.web3);
    this.accounts = this.web3.eth.accounts;
    console.log(this.accounts);
  }

  async setInstance(): Promise<void> {
    new Promise((resolve, reject) => {
      this.UprtclContract.deployed(instance => {
        this.uprtclInstance = instance;
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  }

  private async hash(data: string): Promise<string> {
    const encoded = await multihashing(Buffer.Buffer.from(data), 'sha3-256');
    return '0x' + encoded.toString('hex');
  }

  async getContext(contextId: string): Promise<Context> {
    return this.ipfsClient.getData(contextId);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    /** Content addressable part comes from IPFS */
    const persp = await this.ipfsClient.getData(perspectiveId);
    persp.id = perspectiveId;

    /** Head comes from ethereum */
    const result = await this.uprtclInstance.getPerspective(perspectiveId);
    persp.headId = result.head;

    return persp;
  }

  async getCommit(commitId: string): Promise<Commit> {
    return this.ipfsClient.getData(commitId);
  }

  /**
   * Ethereum dont know of root contexts. The consumer app can decide
   * the logic (multihash) used to derive the id of the root context of
   * a user and directly query for it using getContext(rootContextId)
   */
  async getRootContextId(): Promise<string> {
    const context = new Context(userId, 0, 0);
    return this.ipfsClient.getObjectId(context);
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    let events = await this.uprtclInstance
      .PerspectiveAdded({
        filter: {
          contextId: contextId
        },
        fromBlock: 0
      })
      .getPromise();

    let perspectiveIds = events.map(e => e.perspectiveId);

    // TODO: paralelize calls with Promise.all
    let perspectives = [];
    for (let i = 0; i < perspectiveIds.length; i++) {
      let perspective = await this.getPerspective(perspectiveIds[i]);
      perspectives.push(perspective);
    }

    return perspectives;
  }

  async createContext(context: Context): Promise<string> {
    return this.ipfsClient.createData(context);
  }

  async createPerspective(perspective: Perspective): Promise<string> {
    /** Store the perspective data in the data layer */
    let perspectiveId = await this.ipfsClient.createData(perspective);

    let perspectiveIdHash = this.hash(perspectiveId);
    let contextIdHash = this.hash(perspective.contextId);

    await this.uprtclInstance.methods[
      'addPerspective(bytes32,bytes32,address)'
    ](perspectiveIdHash, contextIdHash, userId, { from: this.accounts[0] });

    return perspectiveIdHash;
  }

  async createCommit(commit: Commit) {
    return this.ipfsClient.createData(commit);
  }

  async updateHead(perspectiveId: string, commitId: string): Promise<void> {
    throw new Error(perspectiveId + commitId);
  }

  async getHead(perspectiveId: string): Promise<string> {
    throw new Error(perspectiveId);
  }
}

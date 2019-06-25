import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { DataMultiplatform } from './multiplatform/data.multiplatform';

import { DataHolochain } from './holochain/data.holochain';
// import { DraftHolochain } from './holochain/draft.holochain';
import { UprtclHolochain } from './holochain/uprtcl.holochain';
import { DiscoveryHolochain } from './holochain/discovery.holochain';

import { DataCollectiveOne } from './c1/data.c1';
// import { DraftCollectiveOne } from './c1/draft.c1';
import { UprtclCollectiveOne } from './c1/uprtcl.c1';
import { DiscoveryCollectiveOne } from './c1/discovery.c1';

import { UprtclEthereum } from './eth/uprtcl.eth';

import { DataIpfs } from './data.ipfs';
import { DraftLocal } from './local/draft.local';
import { TextNode } from './../types';

export const holochainEnabled = false;
export const c1Enabled = true;
export const ethEnabled = true;

export const holochainServiceProvider =
  'holochain://Qmag7yGbYSMhkzDZLnSJkc4pzNWpHLtfP5o2jL8jGF4W5w';

export const c1ServiceProvider = 'https://www.collectiveone.org/uprtcl/1';

export const ethServiceProvider = 'eth://smartContract';

const ethLocation = 'ws://127.0.0.1:8545';
const ipfsConfig = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
};

let uprtclConfig = {};
let dataConfig = {};

if (c1Enabled) {
  uprtclConfig[c1ServiceProvider] = {
    service: new UprtclCollectiveOne(),
    discovery: new DiscoveryCollectiveOne()
  };
  dataConfig[c1ServiceProvider] = {
    discovery: new DiscoveryCollectiveOne(),
    service: new DataCollectiveOne()
  };
}

if (holochainEnabled) {
  uprtclConfig[holochainServiceProvider] = {
    service: new UprtclHolochain(),
    discovery: new DiscoveryHolochain()
  };
  dataConfig[holochainServiceProvider] = {
    discovery: new DiscoveryHolochain(),
    service: new DataHolochain()
  };
}

if (ethEnabled) {
  uprtclConfig[ethServiceProvider] = {
    service: new UprtclEthereum(ethLocation, ipfsConfig),
    discovery: new DiscoveryCollectiveOne()
  };
  dataConfig[ethServiceProvider] = {
    discovery: new DiscoveryCollectiveOne(),
    service: new DataIpfs(ipfsConfig)
  };
}

export const uprtclMultiplatform = new UprtclMultiplatform(uprtclConfig, c1ServiceProvider);
export const dataMultiplatform = new DataMultiplatform(dataConfig, c1ServiceProvider);
export const draftService = new DraftLocal<{
  commitId: string;
  draft: TextNode;
}>();

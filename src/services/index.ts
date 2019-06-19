import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { DataMultiplatform } from './multiplatform/data.multiplatform';

import { DataLocal } from './local/data.local';
import { DraftLocal } from './local/draft.local';

import { DataHolochain } from './holochain/data.holochain';
import { DraftHolochain } from './holochain/draft.holochain';
import { UprtclHolochain } from './holochain/uprtcl.holochain';
import { DiscoveryHolochain } from './holochain/discovery.holochain';

import { DataCollectiveOne } from './c1/data.c1';
import { DraftCollectiveOne } from './c1/draft.c1';
import { UprtclCollectiveOne } from './c1/uprtcl.c1';
import { DiscoveryCollectiveOne } from './c1/discovery.c1';

import { UprtclEthereum } from './eth/uprtcl.eth';

import { DataIpfs } from './data.ipfs';
import { CidConfig } from './local/cid.config';

export const holochainEnabled = false;
export const c1Enabled = false;
export const ethEnabled = true;

export const holochainServiceProvider =
  'holochain://Qmag7yGbYSMhkzDZLnSJkc4pzNWpHLtfP5o2jL8jGF4W5w';

export const c1ServiceProvider = 
  'https://www.collectiveone.org/uprtcl/1';

export const ethServiceProvider = 
  'eth://smartContract';

/** standard C1 settings */
export const c1Cid   = new CidConfig('base58btc', 1, 'raw',    'sha3-256');
export const hcCid   = new CidConfig('base58btc', 0, 'dag-pb', 'sha2-256');
export const ipfsCid = new CidConfig('base58btc', 0, 'dag-pb', 'sha2-256');
 
let uprtclConfig = {};
let dataConfig = {};

if (c1Enabled) {
  uprtclConfig[c1ServiceProvider] = {
    service: new UprtclCollectiveOne(),
    discovery: new DiscoveryCollectiveOne()
  };
  dataConfig[c1ServiceProvider] = {
    discovery: new DiscoveryCollectiveOne(),
    service: {
      data: new DataCollectiveOne(),
      draft: new DraftCollectiveOne()
    }
  };
}

if (holochainEnabled) {
  uprtclConfig[holochainServiceProvider] = {
    service: new UprtclHolochain(),
    discovery: new DiscoveryHolochain()
  };
  dataConfig[holochainServiceProvider] = {
    discovery: new DiscoveryHolochain(),
    service: {
      data: new DataHolochain(),
      draft: new DraftHolochain()
    }
  };

  dataConfig['ipfs'] = {
    discovery: null,
    service: {
      data: new DataIpfs('ipfs.infura.io'),
      draft: null
    }
  };
}

if (ethEnabled) {
  uprtclConfig[ethServiceProvider] = {
    service: new UprtclEthereum('ws://127.0.0.1:8545'),
    discovery: null
  };
  dataConfig[ethServiceProvider] = {
    discovery: null,
    service: {
      data: new DataLocal(ipfsCid),
      draft: new DraftLocal()
    }
  };
}

export const uprtclMultiplatform = new UprtclMultiplatform(uprtclConfig, ipfsCid);

export const dataMultiplatform = new DataMultiplatform(dataConfig, ipfsCid);

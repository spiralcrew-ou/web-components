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

export const holochainEnabled = false;
export const holochainServiceProvider =
  'holochain://Qmag7yGbYSMhkzDZLnSJkc4pzNWpHLtfP5o2jL8jGF4W5w';

export const c1Enabled = true;
export const c1ServiceProvider = 'https://www.collectiveone.org/uprtcl/1';

export const ethEnabled = false;
export const ethServiceProvider = 'eth://smartContract';

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
      data: new DataLocal(),
      draft: new DraftLocal()
    }
  };
}

export const uprtclMultiplatform = new UprtclMultiplatform(uprtclConfig);

export const dataMultiplatform = new DataMultiplatform(dataConfig);

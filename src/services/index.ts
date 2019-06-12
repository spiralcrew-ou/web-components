import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { DataMultiplatform } from './multiplatform/data.multiplatform';

import { UprtclLocal } from './local/uprtcl.local';
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

import * as dotenv from 'dotenv';
import { DataIpfs } from './data.ipfs';

dotenv.config();

export const holochainEnabled = false;
export const holochainServiceProvider =
  'holochain://Qme47WvAbj3a3W8RwChUd2Dcid1AVYWge4zDEztBkUjeMY';
export const c1ServiceProvider = 'https://www.collectiveone.org/uprtcl/1';

export const localServiceProvider = 'local';

let uprtclConfig = {
  local: {
    service: new UprtclLocal(),
    discovery: null
  },

  [c1ServiceProvider]: {
    service: new UprtclCollectiveOne(),
    discovery: new DiscoveryCollectiveOne()
  }
};

let dataConfig = {
  local: {
    service: new DataLocal(),
    discovery: null,
    draft: new DraftLocal()
  },

  [c1ServiceProvider]: {
    service: new DataCollectiveOne(),
    discovery: new DiscoveryCollectiveOne(),
    draft: new DraftCollectiveOne()
  }
};

if (holochainEnabled) {
  uprtclConfig[holochainServiceProvider] = {
    service: new UprtclHolochain(),
    discovery: new DiscoveryHolochain()
  };
  dataConfig[holochainServiceProvider] = {
    service: new DataHolochain(),
    discovery: new DiscoveryHolochain(),
    draft: new DraftHolochain()
  };
  dataConfig['ipfs'] = {
    service: new DataIpfs('ipfs.infura.io'),
    discovery: null,
    draft: null
  };
}

export const uprtclMultiplatform = new UprtclMultiplatform(uprtclConfig);

export const dataMultiplatform = new DataMultiplatform(dataConfig);

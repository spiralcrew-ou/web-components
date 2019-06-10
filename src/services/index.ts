import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { DataMultiplatform } from './multiplatform/data.multiplatform';

import { UprtclLocal } from './local/uprtcl.local';
import { DataLocal } from './local/data.local';
import { DraftLocal } from './local/draft.local';

// import { DataHolochain } from './holochain/data.holochain';
// import { DraftHolochain } from './holochain/draft.holochain';
// import { UprtclHolochain } from './holochain/uprtcl.holochain';
// import { DiscoveryHolochain } from './holochain/discovery.holochain';

import { DataCollectiveOne } from './c1/data.c1';
import { DraftCollectiveOne } from './c1/draft.c1';
import { UprtclCollectiveOne } from './c1/uprtcl.c1';
import { DiscoveryCollectiveOne } from './c1/discovery.c1';

import * as dotenv from 'dotenv';

dotenv.config();

export const holochainServiceProvider =
  'holochain://QmZzGUdC7C6ZDKGzMCWX3b4gV8cXH8W934JUwNLYLDs2az';
export const c1ServiceProvider = 'https://www.collectiveone.org/uprtcl/1';

export const localServiceProvider = 'local'

let uprtclConfig = {
  local: {
    service: new UprtclLocal(),
    discovery: null
  },

  [c1ServiceProvider]: {
    service: new UprtclCollectiveOne(),
    discovery: new DiscoveryCollectiveOne()
  },
  // [holochainServiceProvider]: {
  //   service: new UprtclHolochain(),
  //   discovery: new DiscoveryHolochain()
  // }
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
  },
  // [holochainServiceProvider]: {
  //   service: new DataHolochain(),
  //   discovery: new DiscoveryHolochain(),
  //   draft: new DraftHolochain()
  // }
};

export const uprtclMultiplatform = new UprtclMultiplatform(uprtclConfig);

export const dataMultiplatform = new DataMultiplatform(dataConfig);

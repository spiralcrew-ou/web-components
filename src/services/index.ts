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

dotenv.config();

let draft = null;

let holochainOrigin =
  'holochain://QmZzGUdC7C6ZDKGzMCWX3b4gV8cXH8W934JUwNLYLDs2az';
let defaultService = holochainOrigin;

//let defaultService = 'https://www.collectiveone.org/uprtcl/1';

switch (defaultService) {
  case 'local':
    draft = new DraftLocal();
    break;

  case 'https://www.collectiveone.org/uprtcl/1':
    draft = new DraftCollectiveOne();
    break;

  case holochainOrigin:
    draft = new DraftHolochain();
    break;

  default:
    console.error('unexpected default service ' + defaultService);
}

let uprtclConfig = {
  local: {
    service: new UprtclLocal(),
    discovery: null
  },

  'https://www.collectiveone.org/uprtcl/1': {
    service: new UprtclCollectiveOne(),
    discovery: new DiscoveryCollectiveOne()
  }
};

let dataConfig = {
  local: {
    service: new DataLocal(),
    discovery: null
  },

  'https://www.collectiveone.org/uprtcl/1': {
    service: new DataCollectiveOne(),
    discovery: new DiscoveryCollectiveOne()
  }
};

if (defaultService.includes('holochain')) {
  uprtclConfig[holochainOrigin] = {
    service: new UprtclHolochain(),
    discovery: new DiscoveryHolochain()
  };
  dataConfig[holochainOrigin] = {
    service: new DataHolochain(),
    discovery: new DiscoveryHolochain()
  };
}

export const uprtclMultiplatform = new UprtclMultiplatform(
  uprtclConfig,
  defaultService
);

export const dataMultiplatform = new DataMultiplatform(
  dataConfig,
  draft,
  defaultService
);

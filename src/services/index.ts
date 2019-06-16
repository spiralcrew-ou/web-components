import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { DataMultiplatform } from './multiplatform/data.multiplatform';

import { DataHolochain } from './holochain/data.holochain';
import { DraftHolochain } from './holochain/draft.holochain';
import { UprtclHolochain } from './holochain/uprtcl.holochain';
import { DiscoveryHolochain } from './holochain/discovery.holochain';

import { DataCollectiveOne } from './c1/data.c1';
import { DraftCollectiveOne } from './c1/draft.c1';
import { UprtclCollectiveOne } from './c1/uprtcl.c1';
import { DiscoveryCollectiveOne } from './c1/discovery.c1';

export const holochainEnabled = false;
export const holochainServiceProvider =
  'holochain://QmT7uU1BdyuKYdNwFzFv3dJmaJuWE1eZwJW4wm1n5gVSex';

export const c1Enabled = true;
export const c1ServiceProvider = 'https://www.collectiveone.org/uprtcl/1';

export const localServiceProvider = 'local';

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
    service: { data: new DataHolochain(), draft: new DraftHolochain() }
  }; /* 
  dataConfig['ipfs'] = {
    service: new DataIpfs('ipfs.infura.io'),
    discovery: null,
    draft: null
  };
 */
}

export const uprtclMultiplatform = new UprtclMultiplatform(uprtclConfig);

export const dataMultiplatform = new DataMultiplatform(dataConfig);

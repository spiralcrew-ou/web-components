import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { UprtclLocal } from './local/uprtcl.local';
import { DataMultiplatform } from './multiplatform/data.multiplatform';
import { DataLocal } from './local/data.local';
import { DraftLocal } from './local/draft.local';

//import { DataHolochain } from './holochain/data.holochain';
//import { UprtclHolochain } from './holochain/uprtcl.holochain';
//import { DiscoveryHolochain } from './holochain/discovery.holochain';

export const uprtclMultiplatform = new UprtclMultiplatform(
  {
    local: { service: new UprtclLocal(), discovery: null }
    /* holochain: {
      service: new UprtclHolochain(),
      discovery: new DiscoveryHolochain()
    } */
  },
  'local'
);

export const dataMultiplatform = new DataMultiplatform(
  {
    local: { service: new DataLocal(), discovery: null }
    /* holochain: {
    service: new DataHolochain(),
    discovery: new DiscoveryHolochain()
  } */
  },
  new DraftLocal(),
  'local'
);

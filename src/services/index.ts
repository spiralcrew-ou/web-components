import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
import { DataMultiplatform } from './multiplatform/data.multiplatform';

//import { UprtclLocal } from './local/uprtcl.local';
//import { DataLocal } from './local/data.local';
//import { DraftLocal } from './local/draft.local';

import { DraftHolochain } from './holochain/draft.holochain';
import { DataHolochain } from './holochain/data.holochain';
import { UprtclHolochain } from './holochain/uprtcl.holochain';
import { DiscoveryHolochain } from './holochain/discovery.holochain';

export const uprtclMultiplatform = new UprtclMultiplatform(
  {
    // local: { service: new UprtclLocal(), discovery: null }
    'holochain://QmVE6tmbcHPDkC2ULueG73hH2RcqNmrcDLY4RcuuwWQoN7': {
      service: new UprtclHolochain(),
      discovery: new DiscoveryHolochain()
    }
  },
  'holochain://QmVE6tmbcHPDkC2ULueG73hH2RcqNmrcDLY4RcuuwWQoN7'
);

export const dataMultiplatform = new DataMultiplatform(
  {
    //local: { service: new DataLocal(), discovery: null }
    'holochain://QmVE6tmbcHPDkC2ULueG73hH2RcqNmrcDLY4RcuuwWQoN7': {
      service: new DataHolochain(),
      discovery: new DiscoveryHolochain()
    }
  },
  new DraftHolochain(),
  'holochain://QmVE6tmbcHPDkC2ULueG73hH2RcqNmrcDLY4RcuuwWQoN7'
);

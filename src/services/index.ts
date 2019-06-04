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
    'holochain://Qme2riuQTbZpPt2LekWyi4GuCz53rmEA7g2xtXhgmqccpp': {
      service: new UprtclHolochain(),
      discovery: new DiscoveryHolochain()
    }
  },
  'holochain://Qme2riuQTbZpPt2LekWyi4GuCz53rmEA7g2xtXhgmqccpp'
);

export const dataMultiplatform = new DataMultiplatform(
  {
    //local: { service: new DataLocal(), discovery: null }
    'holochain://Qme2riuQTbZpPt2LekWyi4GuCz53rmEA7g2xtXhgmqccpp': {
      service: new DataHolochain(),
      discovery: new DiscoveryHolochain()
    }
  },
  new DraftHolochain(),
  'holochain://Qme2riuQTbZpPt2LekWyi4GuCz53rmEA7g2xtXhgmqccpp'
);

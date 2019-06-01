import { UprtclMultiplatform } from './multiplatform/uprtcl.multiplatform';
// import { UprtclHolochain } from './holochain/uprtcl.holochain';
// import { DiscoveryHolochain } from './holochain/discovery.holochain';
// import { UprtclLocal } from './local/uprtcl.local';
import { UprtclCollectiveOne } from './c1/uprtcl.c1';
import { DiscoveryCollectiveOne } from './c1/discovery.c1';

import { DataMultiplatform } from './multiplatform/data.multiplatform';
// import { DataLocal } from './local/data.local';
import { DataCollectiveOne } from './c1/data.c1';
// import { DataHolochain } from './holochain/data.holochain';

export const uprtclMultiplatform = new UprtclMultiplatform(
  {
    "https://www.collectiveone.org/uprtcl/1": { 
      service: new UprtclCollectiveOne(), 
      discovery: new DiscoveryCollectiveOne() 
    },
  },
  'https://www.collectiveone.org/uprtcl/1'
);

export const dataMultiplatform = new DataMultiplatform({
  'https://www.collectiveone.org/uprtcl/1': { 
    service: new DataCollectiveOne(), 
    discovery: new DiscoveryCollectiveOne() 
  },
});

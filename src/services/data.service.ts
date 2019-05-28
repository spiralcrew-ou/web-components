import { DataHolochain } from '../services/holochain/data.holochain'
import { UprtclHolochain } from './holochain/uprtcl.holochain';
import { DataLocal } from './local/data.local';
import { UprtclData } from './local/uprtcl.local';

export interface DataService {
  getData(dataId: string): Promise<any>;
  createData(data: any): Promise<string>;
}

const serviceProviders ={
  HOLOCHAIN: 'HOLOCHAIN',
  C1: 'C1',
  LOCAL: 'LOCAL'
}
export const factory = {
  // Service provider could be: [HOLOCHAIN, C1,LOCAL]
  getDataService : (serviceProvider: string)  => {
    switch(serviceProvider) {
      case serviceProviders.LOCAL:
        return new DataLocal()
      case serviceProviders.HOLOCHAIN:
        return new DataHolochain();
      case serviceProviders.C1:
        return null
      default:
        return null
    }
  },
  getUprtclService: (serviceProvider: string) => {
    switch(serviceProvider) {
      case serviceProviders.LOCAL:
        return new UprtclData()
      case serviceProviders.HOLOCHAIN:
        return new UprtclHolochain()
      case serviceProviders.C1:
        return null
      default:
        return null
    }
  },
  getServiceProviders: ():Array<string> => {
    return [serviceProviders.HOLOCHAIN,serviceProviders.C1,serviceProviders.LOCAL]
  },
}
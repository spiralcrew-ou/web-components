import { connect } from '@holochain/hc-web-client';

// Auxiliar type for Holochain's get_entry call
export interface EntryResult<T = any> {
  entry: T;
  type: string;
}

const host = 'ws://3.130.73.99:80';
//const host = 'ws://localhost:8888';

export class HolochainConnection {
  connection: (funcName: string, params: any) => Promise<any>;
  connectionReady: Promise<any>;

  constructor(instanceId: string, zome: string) {
    this.connectionReady = connect(host).then(({ callZome }) => {
      this.connection = async (funcName: string, params: any) =>
        await callZome(instanceId, zome, funcName)(params);
    });
  }

  public async call(funcName: string, params: any): Promise<any> {
    await this.ready();
    console.log('[CALL ZOME FUNCTION]:', funcName, params);
    const jsonString = await this.connection(funcName, params);

    const result = JSON.parse(jsonString);

    if (result.Err) throw new Error(JSON.stringify(result.Err));
    if (result.SerializationError) {
      throw new Error(JSON.stringify(result.SerializationError));
    }

    console.log('[RESULT]:', funcName, params, result);
    if (result.Ok) return result.Ok;
    return result;
  }

  public ready(): Promise<void> {
    if (this.connection) return Promise.resolve();
    else return this.connectionReady;
  }

  public parseEntry(entry) {
    let parseable = entry.Ok ? entry.Ok : entry;
    return JSON.parse(parseable.App[1]);
  }

  public parseEntryResult<T>(entry): EntryResult<T> {
    return {
      entry: {
        id: entry.result.Single.meta.address,
        ...this.parseEntry(entry.result.Single.entry)
      },
      type: entry.result.Single.meta.entry_type.App
    };
  }

  public parseEntries(entryArray: Array<any>) {
    return entryArray.map(entry => this.parseEntry(entry));
  }

  public parseEntriesResults<T>(entryArray: Array<any>): Array<EntryResult<T>> {
    return entryArray.map(entry =>
      this.parseEntryResult(entry.Ok ? entry.Ok : entry)
    );
  }
}

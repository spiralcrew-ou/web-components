import * as _ from 'lodash';

export class BaseMock {
  logEnabled = false;

  setLogs(enabled: boolean) {
    this.logEnabled = enabled;
  }

  log(...args) {
    if (this.logEnabled) console.log(...args);
  }

  get<O>(object: O): Promise<O> {
    return Promise.resolve(_.cloneDeep(object));
  }
}

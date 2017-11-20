import * as lodash from 'lodash';

export default class Mocker {

  constructor(sourceModule, mockedModule) {

    this.source = sourceModule;
    this.backup = { ...sourceModule };
    this.mock = mockedModule;

    lodash.bindAll(this, ['restore', 'mockSourceModule']);

    this.mockSourceModule();
    return this;
  }


  mockSourceModule() {
    const { source, mock } = this;
    Object.keys(mock).forEach(key => {
      source[key] = mock[key];
    });
  }

  restore() {
    const { source, backup } = this;
    Object.keys(backup).forEach(key => {
      source[key] = backup[key];
    });
  }
}

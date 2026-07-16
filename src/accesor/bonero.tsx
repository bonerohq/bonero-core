export class BoneroAccessor {
  private dataSet: unknown;

  constructor(dataSet: unknown) {
    this.dataSet = dataSet;
  }

  getDataSet() {
    return this.dataSet;
  }
}

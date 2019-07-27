export interface ISuite {
  id: string;
  description: string;
  fullName: string;
  failedExpectations: any[];
  testPath: string;
}

export interface ISpec {
  id: string;
  description: string;
  fullName: string;
  failedExpectations: any[];
  passedExpectations: any[];
  pendingReason: string;
  testPath: string;
}

export class Reporter {
  currentSpec!: ISpec;
  currentSuite!: ISuite;
  totalSpecsDefined!: number;
  suites!: ISuite[];
  specs!: ISpec[];

  findSpec(id: string) {
    return this.specs.find(s => s.id === id);
  }

  findSuite(id: string) {
    return this.suites.find(s => s.id === id);
  }

  jasmineStarted(suiteInfo: any) {
    this.totalSpecsDefined = suiteInfo.totalSpecsDefined;
    this.suites = [];
    this.specs = [];
  }

  suiteStarted(result: ISuite) {
    const suite = this.findSuite(result.id);
    if (!suite) {
      this.suites.push(result);
    }
    this.currentSuite = { ...result };
  }

  specStarted(result: ISpec) {
    const spec = this.findSpec(result.id);
    if (!spec) {
      this.specs.push(result);
    }
    this.currentSpec = { ...result };
  }

  specDone(result: ISpec) {
    delete this.currentSpec;
  }

  suiteDone(result: ISuite) {
    delete this.currentSuite;
  }

  jasmineDone() {
    delete this.totalSpecsDefined;
    delete this.suites;
    delete this.specs;
  }
}

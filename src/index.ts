import {
  back as Nock,
  NockBackMode,
  NockBackOptions,
  NockDefinition,
  Scope
} from "nock";
import Path from "path";
import { kebabCase } from "lodash";
import { Reporter } from "./reporter";

const { TEST_MODE } = process.env;

export interface IJestNockBackOptions {
  defaultMode: NockBackMode;
  fixtureDir: string;
  jasmine: any;
  global: any;
  generateMockName(
    testTitle: string,
    testPath: string,
    reporter: Reporter,
    fixtureDirectory: string
  ): string;
  nock: Partial<NockBackOptions>;
}

const overrideMethods = [
  "it",
  "fit",
  "xit",
  "beforeAll",
  "beforeEach",
  "afterAll",
  "afterEach"
];

// const addMethods = ["beforeAll", "beforeEach", "afterAll", "afterEach"];

const optionDefaults: IJestNockBackOptions = {
  fixtureDir: "test/fixtures",
  jasmine: null,
  global: null,
  defaultMode: "dryrun",
  generateMockName,
  nock: {
    before,
    after,
    afterRecord
  }
};

export function JestNockBack(options?: Partial<IJestNockBackOptions>) {
  const opts: IJestNockBackOptions = Object.assign({}, optionDefaults, options);
  const { jasmine, global: _global, fixtureDir, defaultMode } = opts;
  // debugger;
  if (!jasmine || !_global) {
    throw new Error(
      "Must provide `jasmine` and `global` as options to this function!"
    );
  }

  const nockMode = (TEST_MODE as NockBackMode) || defaultMode || "dryrun";

  // Resolve whatever path was given to us and turn it into absolute path
  Nock.fixtures = opts.fixtureDir = Path.resolve(fixtureDir);
  Nock.setMode(nockMode);

  const env = jasmine.getEnv();
  const testPath = jasmine.testPath;
  const reporter = new Reporter();
  env.addReporter(reporter);

  overrideMethods.forEach(method => {
    _global[method].nock = bindNock(
      method,
      env[method],
      jasmine,
      reporter,
      testPath,
      opts
    );
  });

  // addMethods.forEach(method => {
  //   const newMethod = `nock${upcase(method)}`;
  //   _global[newMethod] = _global[method] = bindNock(
  //     newMethod,
  //     _global[method],
  //     jasmine,
  //     reporter,
  //     testPath,
  //     opts
  //   );
  // });
}

function bindNock(
  method: string,
  fn: any,
  jasmine: any,
  reporter: any,
  testPath: string,
  options: IJestNockBackOptions
) {
  return function test(...args: any[]) {
    let title: string;
    let testFn: Function;
    let timeout: number;

    const isLifecycle = args.length <= 2 && typeof args[0] === "function";

    if (isLifecycle) {
      testFn = args[0];
      timeout = args[1];
      title = method;
    } else {
      title = args[0];
      testFn = args[1];
      timeout = args[2];
    }

    // Handle callback style tests
    if (testFn! && testFn!.length) {
      testFn = wrapTestFnCallbackWithPromise(testFn!);
    }

    // Replace the fn w/ our wrapped one
    testFn = nockedTestFn(
      method,
      title!,
      testFn!,
      jasmine,
      reporter,
      testPath,
      options
    );

    return isLifecycle ? fn(testFn, timeout!) : fn(title!, testFn, timeout!);
  };
}

function nockedTestFn(
  method: string,
  title: string,
  fn: any,
  jasmine: any,
  reporter: Reporter,
  testPath: string,
  options: IJestNockBackOptions
) {
  return async () => {
    const fixtureName = options.generateMockName(
      title,
      testPath,
      reporter,
      options.fixtureDir
    );

    Nock.fixtures = Path.join(Path.dirname(testPath), "__fixtures__");

    // Open up fixture recording
    const { nockDone, context } = await Nock(fixtureName, options.nock);

    // Start executing the test
    const ret = fn.call({ nock: context });

    // If it wasn't a promise, this was a "syncronous"
    // test, and we are done.
    if (!isPromise(ret)) {
      nockDone();
      return ret;
    }

    // Otherwise wait around for the test's
    // Promise chain to finish up.
    return ret.finally(() => nockDone());
  };
}

function generateMockName(
  testTitle: string,
  testPath: string,
  reporter: Reporter,
  fixtureDirectory: string
) {
  const shortPath = Path.relative(fixtureDirectory, testPath);
  const testExt = Path.extname(shortPath);
  const testPrefix = shortPath.replace("../", "").replace(testExt, "");
  const {
    currentSpec: { fullName }
  } = reporter;
  return kebabCase(`${fullName}`) + ".json";
}

function after(scope: Scope) {}

function before(def: NockDefinition) {}

function afterRecord(defs: NockDefinition[]) {
  return defs;
}

function isPromise(val: any) {
  return val && typeof val.then === "function";
}

function wrapTestFnCallbackWithPromise(testFn: Function) {
  return () => {
    return new Promise((resolve, reject) => {
      return testFn((err: any) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  };
}

function upcase(str: string) {
  if (!str || !str.length) return str;
  return str[0].toUpperCase() + str.slice(1);
}

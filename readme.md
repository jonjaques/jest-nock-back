# Jest Nock Back

Record HTTP fixtures (**N**etwork M**ocks**) for your tests. This is simply a light Jest-wrapper around [Nock](https://github.com/nock/nock)'s [nock-back](https://github.com/nock/nock#nock-back) feature.

> Heavily inspired by [jest-nock](https://www.npmjs.com/package/jest-nock)

## Usage

Configure Jest to setup this module.

```js
// setup.js
import { JestNockBack } from "../src/index";

JestNockBack({
  jasmine,
  global
});
```

```js
// jest.config.js
module.exports = {
  // ...
  setupFilesAfterEnv: ["./setup.ts"]
  // ...
};
```

Write tests as normal, except for tests you will want to mock, should append `.nock` to the test definition.
Works for (`it`, `beforeEach` et. al., though only tested for `it`)

```js
// my-test.js
import Axios from "axios";

describe("e2e", () => {
  it.nock("should record fixtures for http calls", async () => {
    const example = await Axios.get("https://example.com");
    expect(example.status).toBe(200);
    expect(example.data).toMatchSnapshot();
  });
});
```

By default, this will hit the network and perform normally.

To record fixtures, run the tests in `record` mode.

```
$ TEST_MODE=record jest
```

If a fixture is found for a given test (`it.nock`), all requests will be played back
from the filesystem and it will not hit the network. If a request is not found, Nock will give a connection error. This is by design, and likely an indicator that you need to fix your test or your fixture. To rerecord, simply remove the offending fixture, and run tests in `record` mode again.

This will generate fixture files in the directory you configured (`test/fixtures` be default).

## Options

See here for examples of how `nock` options can be used: https://github.com/nock/nock#options-1

```ts
interface IJestNockBackOptions {
  defaultMode?: NockBackMode;
  fixtureDir?: string;
  jasmine: any;
  global: any;
  generateMockName?(
    testTitle: string,
    testPath: string,
    fixtureDirectory: string
  ): string;
  nock?: Partial<NockBackOptions>;
}
```

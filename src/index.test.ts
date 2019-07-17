import { JestNockBack } from "./index";

describe("JestNockBack options", () => {
  it("should throw if not given `jasmine` and `global`", () => {
    const expectedError =
      "Must provide `jasmine` and `global` as options to this function!";
    expect(() => JestNockBack({ jasmine: {} })).toThrowError(expectedError);
    expect(() => JestNockBack({ global: {} })).toThrowError(expectedError);
  });

  it("should not throw if given the right options", () => {
    expect(() => JestNockBack({ jasmine, global })).not.toThrow();
  });
});

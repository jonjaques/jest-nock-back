import Axios from "axios";

describe("e2e", () => {
  it("should run", () => {
    expect(true).toBe(true);
  });

  it("should wrap an async fn", function(done) {
    // console.log("not nocked", this);
    expect(false).toBe(false);
    done();
  });

  (it as any).nock("should record fixtures for http calls", async () => {
    // console.log("nocked", this);
    const example = await Axios.get("https://example.com");
    expect(example.status).toBe(200);
    expect(example.data).toMatchSnapshot();
  });
});

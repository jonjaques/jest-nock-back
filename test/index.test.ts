import Axios from "axios";

describe("jest test fns", () => {
  it("should run", () => {
    expect(true).toBe(true);
  });

  it.nock("should wrap an async fn", function(done) {
    expect(false).toBe(false);
    done();
  });

  it.nock("should record fixtures for http calls", async () => {
    const example = await Axios.get("https://example.com");
    expect(example.status).toBe(200);
    expect(example.data).toMatchSnapshot();
  });

  describe("should do nested stuff", () => {
    describe("nested", () => {
      describe("nested once more", () => {
        it.nock("make it so", () => {
          expect("Riker").toBeTruthy();
        });
      });
    });
  });
});

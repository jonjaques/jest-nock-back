export {};

declare global {
  namespace jest {
    interface It {
      nock: It;
    }
  }
}

export const makeRepoMock = <K extends readonly string[]>(keys: K) =>
  Object.fromEntries(keys.map(k => [k, jest.fn()])) as Record<K[number], jest.Mock>;

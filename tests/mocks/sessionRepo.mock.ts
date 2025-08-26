type TRefreshSessionRepo = {
  get: jest.Mock;
  create: jest.Mock;
  rotate: jest.Mock;
  revokeMany: jest.Mock;
};
export const mockSessionRepo = () => {
  jest.mock("../../src/modules/session/session.repository", () => {
    const [get, create, rotate, revokeMany] = Array.from({ length: 4 }, () => jest.fn());
    const RefreshSessionRepo = { get, create, rotate, revokeMany };
    return {
      RefreshSessionRepo,
      __mock__: { ...RefreshSessionRepo },
      __esmodule: true,
    };
  });
  return () => jest.requireMock("../../src/modules/session/session.repository").__mock__ as TRefreshSessionRepo;
};

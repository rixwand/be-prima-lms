type UserRepoMock = {
  create: jest.Mock;
  findByEmail: jest.Mock;
};
export const mockUserRepo = () => {
  jest.mock("../../src/modules/users/user.repository", () => {
    const [create, findByEmail] = Array.from({ length: 2 }, () => jest.fn());
    return {
      UserRepo: { create, findByEmail },
      __mocks__: { create, findByEmail },
      __esModule: true,
    };
  });
  return (): UserRepoMock =>
    jest.requireMock("../../src/modules/users/user.repository").__mocks__;
};

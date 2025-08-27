type UserRepoMock = {
  create: jest.Mock;
  findByEmail: jest.Mock;
};
export const mockUserRepo = () => {
  jest.mock("../../src/modules/users/user.repository", () => {
    const [create, findByEmail, findById] = Array.from({ length: 3 }, () => jest.fn());
    const userRepo = { create, findByEmail };
    return {
      userRepo,
      __mocks__: userRepo,
      __esModule: true,
    };
  });
  return (): UserRepoMock => jest.requireMock("../../src/modules/users/user.repository").__mocks__;
};

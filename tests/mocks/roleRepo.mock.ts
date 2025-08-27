type RoleRepoMock = {
  // create: jest.Mock;
  findByName: jest.Mock;
};
export const mockRoleRepo = () => {
  jest.mock("../../src/modules/role/role.repository", () => {
    const [findByName] = Array.from({ length: 1 }, () => jest.fn());
    const roleRepo = { findByName };
    return {
      roleRepo,
      __mocks__: roleRepo,
      __esModule: true,
    };
  });
  return (): RoleRepoMock => jest.requireMock("../../src/modules/role/role.repository").__mocks__;
};

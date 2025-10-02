import type { RoleRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/role/role.repository";

type RoleRepo = RoleRepoModule["roleRepo"];
type TRoleRepoMock = { [K in keyof RoleRepo]: jest.Mock };

export const mockRoleRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<RoleRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.roleRepo) as (keyof RoleRepo)[];
    const repoMock = makeRepoMock(keys);
    return { ...actual, roleRepo: repoMock, __mocks__: repoMock, __esModule: true };
  });

  return (): TRoleRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

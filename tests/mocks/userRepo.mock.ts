import type { UserRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/users/user.repository";

type UserRepo = UserRepoModule["userRepo"];
type TUserRepoMock = { [K in keyof UserRepo]: jest.Mock };

export const mockUserRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<UserRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.userRepo) as (keyof UserRepo)[];
    const repoMock = makeRepoMock(keys);
    return { ...actual, userRepo: repoMock, __mocks__: repoMock, __esModule: true };
  });

  return (): TUserRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

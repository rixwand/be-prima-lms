import type { AuthRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/auth/auth.repository";

type AuthRepo = AuthRepoModule["authRepo"];
type TAuthRepoMock = { [K in keyof AuthRepo]: jest.Mock };

export const mockAuthRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<AuthRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.authRepo) as (keyof AuthRepo)[];
    const repoMock = makeRepoMock(keys);

    return {
      ...actual,
      authRepo: repoMock,
      __mocks__: repoMock,
      __esModule: true,
    };
  });

  return (): TAuthRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

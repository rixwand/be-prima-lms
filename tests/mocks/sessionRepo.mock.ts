import type { SessionRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/session/session.repository";

type RefreshSessionRepo = SessionRepoModule["sessionRepo"];
type TRefreshSessionRepoMock = { [K in keyof RefreshSessionRepo]: jest.Mock };

export const mockSessionRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<SessionRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.sessionRepo) as (keyof RefreshSessionRepo)[];
    const repoMock = makeRepoMock(keys);
    return { ...actual, sessionRepo: repoMock, __mocks__: repoMock, __esModule: true };
  });

  return (): TRefreshSessionRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

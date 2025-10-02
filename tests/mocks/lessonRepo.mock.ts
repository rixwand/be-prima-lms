import type { LessonRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/courseDomain/lesson/lesson.repository";

type LessonRepo = LessonRepoModule["lessonRepo"];
type TLessonRepoMock = { [K in keyof LessonRepo]: jest.Mock };

export const mockLessonRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<LessonRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.lessonRepo) as (keyof LessonRepo)[];
    const repoMock = makeRepoMock(keys);
    return { ...actual, lessonRepo: repoMock, __mocks__: repoMock, __esModule: true };
  });

  return (): TLessonRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

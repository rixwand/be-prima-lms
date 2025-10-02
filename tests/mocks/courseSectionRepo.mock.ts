import type { CourseSectionRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/courseDomain/courseSection/courseSection.repository";

type CourseSectionRepo = CourseSectionRepoModule["courseSectionRepo"];
type TCourseSectionRepoMock = { [K in keyof CourseSectionRepo]: jest.Mock };

export const mockCourseSectionRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<CourseSectionRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.courseSectionRepo) as (keyof CourseSectionRepo)[];
    const repoMock = makeRepoMock(keys);
    return { ...actual, courseSectionRepo: repoMock, __mocks__: repoMock, __esModule: true };
  });

  return (): TCourseSectionRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

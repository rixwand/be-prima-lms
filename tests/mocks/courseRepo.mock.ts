import type { CourseRepoModule } from "./_modules.types";
import { makeRepoMock } from "./_utils";

const REPO_PATH = "../../src/modules/courseDomain/course/course.repository";
type CourseRepo = CourseRepoModule["courseRepo"];
type TCourseRepoMock = { [K in keyof CourseRepo]: jest.Mock };
export const mockCourseRepo = () => {
  jest.mock(REPO_PATH, () => {
    const actual = jest.requireActual<CourseRepoModule>(REPO_PATH);
    const keys = Object.keys(actual.courseRepo) as (keyof CourseRepo)[];
    const courseRepoMock = makeRepoMock(keys);
    return {
      ...actual,
      courseRepo: courseRepoMock,
      __mocks__: courseRepoMock,
      __esModule: true,
    };
  });

  return (): TCourseRepoMock => jest.requireMock(REPO_PATH).__mocks__;
};

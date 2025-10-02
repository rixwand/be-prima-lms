/* prettier-ignore-start */
import { mockCourseRepo } from "../mocks/courseRepo.mock";
import { mockUserRepo } from "../mocks/userRepo.mock";
const getCourseSpies = mockCourseRepo();
const getUserSpies = mockUserRepo();
/* prettier-ignore-end */

let courseSpies: ReturnType<ReturnType<typeof mockCourseRepo>>;
let userSpies: ReturnType<ReturnType<typeof mockUserRepo>>;

beforeEach(() => {
  courseSpies = getCourseSpies();
  userSpies = getUserSpies();

  userSpies.findById.mockResolvedValue({
    id: 1,
    roleId: 2,
    status: "ACTIVE",
  });
  // courseSpies.fin.mockResolvedValue({})
});

import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate } from "../../../common/utils/validation";
import enrollmentService from "./enrollment.service";
import { listEnrolledCourseParamsValidation } from "./enrollment.validation";

const listEnrolledCourse: AsyncRequestHandler = async (req, res) => {
  const { limit, page, search } = await validate(listEnrolledCourseParamsValidation, req.query);
  const data = await enrollmentService.list(req.user?.id!, { ...(search && { search }), page, limit });
  res.status(200).json({ data });
};

export default {
  listEnrolledCourse: asyncHandler(listEnrolledCourse),
};

import { ApiError } from "../../../common/utils/http";
import { coursePublishRepository } from "./coursePublish.repository";
import { GetCoursePublishRequestQueries, ICreateCoursePublishRequest } from "./coursePublish.types";

const isExistingRequest = async (reqId: number) => {
  const existingRequest = await coursePublishRepository.findById(reqId);
  if (!existingRequest) {
    throw new ApiError(404, "A publish request for this course is not found.");
  } else return existingRequest;
};

export const coursePublishService = {
  async createRequest(data: ICreateCoursePublishRequest, courseId: number) {
    const existingRequest = await coursePublishRepository.findByCourseId(courseId);
    if (existingRequest && existingRequest.status !== "REJECTED") {
      throw new ApiError(409, "A publish request for this course already exists.");
    }
    if (existingRequest && existingRequest.status == "REJECTED") {
      data.notes = `${existingRequest.notes}\n\n[instructor]: ${data.notes}`;
    }
    return coursePublishRepository.create(
      {
        notes: `[instructor]: ${data.notes}`,
      },
      courseId
    );
  },

  listRequest: async (queries: GetCoursePublishRequestQueries) => {
    const [total, courses] = await coursePublishRepository.listRequest(queries);
    return {
      courses,
      meta: {
        total,
        page: queries.page || 1,
        limit: queries.limit,
        totalPage: Math.ceil(total / (queries.limit || 10)),
      },
    };
  },

  async approveRequest({ reqId, userId }: { reqId: number; userId: number }) {
    const existingRequest = await isExistingRequest(reqId);
    return coursePublishRepository.updateStatus({
      id: existingRequest.id,
      courseId: existingRequest.courseId,
      data: {
        status: "APPROVED",
        notes: `${existingRequest.notes}\n\n[admin]:APPROVED`,
        reviewedById: userId,
      },
    });
  },

  async rejectRequest({ reqId, userId, notes }: { reqId: number; userId: number; notes?: string }) {
    const existingRequest = await isExistingRequest(reqId);
    return await coursePublishRepository.updateStatus({
      id: existingRequest.id,
      courseId: existingRequest.courseId,
      data: {
        status: "REJECTED",
        notes: `${existingRequest.notes}\n\n[admin]:/REJECTED/ ${notes}`,
        reviewedById: userId,
      },
    });
  },
};

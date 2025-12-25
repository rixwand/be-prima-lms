import { $Enums, Prisma } from "@prisma/client";
import { ApiError } from "../../../common/utils/http";
import { courseRepo } from "../course/course.repository";
import { coursePublishRepository } from "./coursePublish.repository";
import {
  GetCoursePublishRequestQueries,
  ICreateCoursePublishRequest,
  IUpdateCoursePublishRequest,
} from "./coursePublish.types";

export const coursePublishService = {
  async createRequest(data: ICreateCoursePublishRequest, courseId: number) {
    const existingRequest = await coursePublishRepository.findByCourseId(courseId);
    if (existingRequest) {
      throw new ApiError(409, "A publish request for this course already exists.");
    }

    return coursePublishRepository.create(data, courseId);
  },

  listRequest: async (queries: GetCoursePublishRequestQueries) => coursePublishRepository.listRequest(queries),

  async updateRequest(id: number, data: IUpdateCoursePublishRequest, reviewedById: number) {
    const request = await coursePublishRepository.findById(id);
    if (!request) {
      throw new ApiError(404, "Publish request not found.");
    }

    // Only allow updating status if it's currently PENDING
    if (request.status !== $Enums.PublishRequestStatus.PENDING) {
      throw new ApiError(400, "Cannot update a request that is not pending.");
    }

    const updatedData: Prisma.CoursePublishRequestUpdateInput = {
      status: data.status,
      notes: data.notes || null,
      reviewedBy: { connect: { id: reviewedById } },
    };

    const updatedRequest = await coursePublishRepository.update(id, updatedData);

    // If approved, update course status to PUBLISHED
    if (updatedRequest.status === $Enums.PublishRequestStatus.APPROVED) {
      await courseRepo.update({ status: $Enums.CourseStatus.PUBLISHED }, updatedRequest.courseId);
    }

    return updatedRequest;
  },

  async deleteRequest(courseId: number) {
    const request = await coursePublishRepository.findByCourseId(courseId);
    if (!request) {
      throw new ApiError(404, "Publish request not found for this course.");
    }
    return coursePublishRepository.delete(request.id);
  },
};

import { PrismaTx } from "../../../common/libs/prisma";
import { withTransaction } from "../../../common/libs/prisma/transaction";
import { ApiError } from "../../../common/utils/http";
import { courseRepo } from "../course/course.repository";
import courseDraftRepo from "../courseDraft/metaDraft.repository";
import { coursePublishRepository } from "./coursePublish.repository";
import { GetCoursePublishRequestQueries, ICreateCoursePublishRequest } from "./coursePublish.types";

const isExistingRequest = async (reqId: number, tx?: PrismaTx) => {
  const existingRequest = await coursePublishRepository.findById(reqId, tx);
  if (!existingRequest) {
    throw new ApiError(404, "Publish request not found.");
  } else return existingRequest;
};

export const coursePublishService = {
  async createRequest(data: Omit<ICreateCoursePublishRequest, "type">, courseId: number) {
    const existingRequest = await coursePublishRepository.findByCourseId(courseId);
    if (existingRequest && existingRequest.status == "PENDING") {
      throw new ApiError(409, "A publish request for this course already exists.");
    }
    if (existingRequest && existingRequest.status == "REJECTED") {
      data.notes = `${existingRequest.notes}\n\n[instructor]: ${data.notes}`;
      return coursePublishRepository.updateStatus({
        courseId,
        id: existingRequest.id,
        data: {
          notes: data.notes,
          status: "PENDING",
          type: "NEW",
        },
      });
    }
    if (existingRequest && existingRequest.status == "APPROVED") {
      const requiresApproval = await courseDraftRepo.isRequiresApproval(courseId);
      if (!requiresApproval) throw new ApiError(409, "Course already published and no changes detected");
      data.notes = `${existingRequest.notes}\n\n[instructor]: ${data.notes}`;
      return coursePublishRepository.updateStatus({
        courseId,
        id: existingRequest.id,
        data: {
          notes: data.notes,
          status: "PENDING",
          type: "UPDATE",
        },
      });
    } else
      return coursePublishRepository.create(
        {
          notes: `[instructor]: ${data.notes}`,
          type: "UPDATE",
        },
        courseId,
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
    return withTransaction(async tx => {
      const existingRequest = await isExistingRequest(reqId, tx);
      if (!existingRequest) throw new ApiError(404, "Publish request not found");
      if (existingRequest.type == "UPDATE") {
        const draftMetaC = await courseDraftRepo.getMetaC(existingRequest.courseId);
        if (!draftMetaC) throw new ApiError(404, "Course Draft not found");
        const { draftCategories, draftDiscounts, draftTags, ...metaC } = draftMetaC;
        return await withTransaction(async tx => {
          await courseRepo.cleanConnection(existingRequest.courseId);
          await courseRepo.applyMetaDraft({
            courseId: existingRequest.courseId,
            tier: "C",
            data: {
              ...metaC,
              categories: {
                create: draftCategories.map(({ draftId, ...c }) => c),
              },
              tags: {
                create: draftTags,
              },
              discounts: {
                create: draftDiscounts.map(({ draftId, ...d }) => d),
              },
            },
            db: tx,
          });
          await coursePublishRepository.approveRequest({
            id: reqId,
            adminId: userId,
            notes: existingRequest.notes,
            db: tx,
          });
          const { title } = await courseDraftRepo.updateMeta({ requiresApproval: [] }, draftMetaC.id, tx);
          return { courseTitle: title };
        });
      }
      await coursePublishRepository.approveRequest({
        id: reqId,
        adminId: userId,
        notes: existingRequest.notes,
        db: tx,
      });
      return await courseRepo.publishCourse({ id: existingRequest.courseId, db: tx });
    });
  },

  async rejectRequest({ reqId, userId, notes }: { reqId: number; userId: number; notes?: string }) {
    const existingRequest = await isExistingRequest(reqId);
    if (existingRequest.status != "PENDING") throw new ApiError(404, "Pending Course not found");
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

  async cancelRequest(courseId: number) {
    const existingRequest = await coursePublishRepository.findByCourseId(courseId);
    if (!existingRequest || existingRequest.status !== "PENDING")
      throw new ApiError(404, "A pending publish request for this course is not found.");
    if (existingRequest.reviewedById) {
      return coursePublishRepository.cancelResubmittedRequest(courseId);
    } else return coursePublishRepository.deleteRequest(courseId);
  },

  // async unPublish(courseId:number) {
  //   const existingRequest = await coursePublishRepository.findByCourseId(courseId)
  //   if(!existingRequest || existingRequest.status !== "APPROVED"){
  //     throw new ApiError(404, "Course not found or its not published")
  //   }
  //   return coursePublishRepository.updateStatus({
  //     id: existingRequest.id,
  //     courseId: existingRequest.courseId,
  //     data: {
  //       status: "DRAFT",
  //       notes: `${existingRequest.notes}\n\n[admin]:APPROVED`,
  //     },
  //   });
  // }
};

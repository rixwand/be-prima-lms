import { prisma } from "../../../common/libs/prisma";
import { optionalizeUndefined } from "../../../common/utils/function";
import { ApiError } from "../../../common/utils/http";
import { ICourseUpdateEntity } from "../course/course.types";

const courseDraftRepo = {
  async upsertMeta({ courseId, data }: { courseId: number; data?: Omit<ICourseUpdateEntity, "discounts"> }) {
    return prisma.$transaction(async tx => {
      const course = await tx.course.findUnique({
        where: { id: courseId },
        select: {
          title: true,
          shortDescription: true,
          descriptionJson: true,
          previewVideo: true,
          priceAmount: true,
          isFree: true,
          coverImage: true,
        },
      });

      if (!course) {
        throw new ApiError(404, "Course not found");
      }

      const { previewVideo, descriptionJson, ...safe } = {
        ...course,
        ...optionalizeUndefined(data),
      };
      // TODO: Find the error paytload not loaded
      console.log("update palyload: ", data);

      return tx.courseMetaDraft.upsert({
        where: { courseId },
        update: data ? optionalizeUndefined(data) : {},
        create: {
          course: { connect: { id: courseId } },
          ...(previewVideo ? { previewVideo } : {}),
          ...(descriptionJson ? { descriptionJson } : {}),
          ...safe,
        },
        select: { id: true },
      });
    });
  },
};

export default courseDraftRepo;

import { isDeepStrictEqual } from "util";
import { withTransaction } from "../../../../common/libs/prisma/transaction";
import { isEmptyTipTapDoc } from "../../../../common/utils/course";
import { ApiError } from "../../../../common/utils/http";
import { lessonRepo } from "./lesson.repository";
import { ILessonPublishContent } from "./lesson.types";

export const lessonService = {
  async getContent(sectionItemId: number) {
    return lessonRepo.getContent(sectionItemId);
  },

  async update(
    {
      contentJson,
      ...lesson
    }: { summary?: string | undefined; contentJson?: { type: "doc"; content: any[] } | undefined },
    sectionItemId: number,
  ) {
    return lessonRepo.update({
      lesson: {
        ...(lesson.summary !== undefined ? { summary: lesson.summary } : {}),
        ...(contentJson !== undefined ? { contentDraft: contentJson } : {}),
      },
      sectionItemId,
    });
  },

  async publishContent({
    sectionItemId,
    newDraft,
  }: {
    sectionItemId: number;
    newDraft?: ILessonPublishContent["newDraft"];
  }) {
    return withTransaction(async tx => {
      const content = newDraft
        ? await lessonRepo.update({ lesson: { contentDraft: newDraft }, sectionItemId }, tx)
        : await lessonRepo.getContent(sectionItemId, tx);
      console.log({ content });
      if (!content?.contentDraft || isEmptyTipTapDoc(content.contentDraft)) {
        throw new ApiError(400, "Cannot publish an empty draft");
      }
      if (isDeepStrictEqual(content.contentLive, content.contentDraft)) {
        return "Content live is already up to date";
      }

      await lessonRepo.update({ lesson: { contentLive: content.contentDraft }, sectionItemId }, tx);
      // await sectionItemRepo.upda
      return "Publish draft content success";
    });
  },
};

import uniqueSlug from "unique-slug";
import { withTransaction } from "../../../../common/libs/prisma/transaction";
import { ApiError } from "../../../../common/utils/http";
import forumRepository from "./forum.repository";
import { ICreaeteForumThreads, IReplyThread } from "./forum.types";

export default {
  createThread: async (thread: ICreaeteForumThreads, { itemId, userId }: { userId: number; itemId: number }) => {
    const forum = await forumRepository.getForumBySectionItemId(itemId);
    if (!forum) throw new ApiError(404, "Error forum not found");
    return forumRepository.createThread({
      authorId: userId,
      forumId: forum.id,
      slug: uniqueSlug(thread.title),
      ...thread,
    });
  },
  getForumThreads: async (sectionItemId: number) => {
    const forum = await forumRepository.getForumThreadsBySectionItemId(sectionItemId);
    if (!forum) throw new ApiError(404, "Error forum not found");
    return forum;
  },
  listForumByUser: async ({}: { userId: number; userRoleId: number }) => {
    // const user =
  },
  replyThread: async (
    { content, repliedToId }: IReplyThread,
    { sectionItemId, threadId, userId }: { userId: number; sectionItemId: number; threadId: number },
  ) =>
    withTransaction(async tx => {
      const thread = await forumRepository.findThreadByIdAndSectionItemId({ id: threadId, sectionItemId }, tx);
      if (!thread) throw new ApiError(404, "Thread not found");
      return forumRepository.createThreadReply(
        {
          authorId: userId,
          threadId: thread.id,
          ...(repliedToId && { parentId: repliedToId }),
          content,
        },
        tx,
      );
    }),

  getThreadReplies: async ({ sectionItemId, threadId }: { sectionItemId: number; threadId: number }) =>
    withTransaction(async tx => {
      console.log({ sectionItemId, threadId });
      const thread = await forumRepository.findThreadByIdAndSectionItemId({ id: threadId, sectionItemId }, tx);
      if (!thread) throw new ApiError(404, "Thread not found");
      return forumRepository.getThreadReplies(thread.id, tx);
    }),
};

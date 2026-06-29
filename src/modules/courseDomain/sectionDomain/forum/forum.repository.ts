import { Json } from "xendit-node";
import { PrismaTx, prisma } from "../../../../common/libs/prisma";

export default {
  createThread: async (
    thread: { title: string; authorId: number; content: Json; forumId: number; slug: string },
    db: PrismaTx = prisma,
  ) => {
    return db.forumThread.create({
      data: thread,
    });
  },
  getForumBySectionItemId: async (sectionItemId: number, db: PrismaTx = prisma) =>
    db.forum.findUnique({ where: { sectionItemId } }),

  getForumThreadsBySectionItemId: async (sectionItemId: number, db: PrismaTx = prisma) =>
    db.forum.findUnique({
      where: { sectionItemId },
      include: {
        threads: {
          include: {
            author: { select: { username: true, fullName: true, profilePict: true } },
            _count: { select: { replies: true } },
          },
        },
      },
    }),

  findThreadByIdAndSectionItemId: async (
    { id, sectionItemId }: { sectionItemId: number; id: number },
    db: PrismaTx = prisma,
  ) =>
    db.forumThread.findUnique({
      where: { id, forum: { sectionItemId } },
    }),

  createThreadReply: async (
    data: {
      content: Json;
      threadId: number;
      parentId?: number;
      authorId: number;
    },
    db: PrismaTx = prisma,
  ) =>
    db.forumThreadReply.create({
      data,
      include: {
        parent: { include: { author: { select: { username: true, fullName: true, profilePict: true } } } },
        author: { select: { username: true, fullName: true, profilePict: true } },
      },
    }),

  getThreadReplies: async (threadId: number, db: PrismaTx = prisma) =>
    db.forumThreadReply.findMany({
      where: { threadId },
      include: { author: { select: { fullName: true, profilePict: true } } },
    }),
};

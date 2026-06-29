import { AsyncRequestHandler, asyncHandler } from "../../../../common/utils/http";
import { validate, validateIdParams } from "../../../../common/utils/validation";
import forumService from "./forum.service";
import { createThreadSchema, replyThreadSchema } from "./forum.validation";

const createThread: AsyncRequestHandler = async (req, res) => {
  const thread = await validate(createThreadSchema, req.body);
  const data = await forumService.createThread(thread, { itemId: req.sectionItem?.id!, userId: req.user?.id! });
  res.status(200).json({ data });
};

const getForumThreads: AsyncRequestHandler = async (req, res) => {
  const data = await forumService.getForumThreads(req.sectionItem?.id!);
  res.status(200).json({ data });
};

const listForumByUser: AsyncRequestHandler = async (req, res) => {
  const forums = await forumService;
};

const replyThread: AsyncRequestHandler = async (req, res) => {
  const { id: threadId } = await validateIdParams(req.params.threadId);
  const data = await validate(replyThreadSchema, req.body);
  const reply = await forumService.replyThread(data, {
    sectionItemId: req.sectionItem?.id!,
    userId: req.user?.id!,
    threadId,
  });
  res.status(200).json({ data: reply });
};

const getThreadReplies: AsyncRequestHandler = async (req, res) => {
  const { id: threadId } = await validateIdParams(req.params.threadId);
  const data = await forumService.getThreadReplies({
    threadId,
    sectionItemId: req.sectionItem?.id!,
  });
  res.status(200).json({ data });
};

export default {
  createThread: asyncHandler(createThread),
  getForumThreads: asyncHandler(getForumThreads),
  replyThread: asyncHandler(replyThread),
  getThreadReplies: asyncHandler(getThreadReplies),
};

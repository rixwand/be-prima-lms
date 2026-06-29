import { InferType } from "yup";
import { createThreadSchema, replyThreadSchema } from "./forum.validation";

export interface ICreaeteForumThreads extends InferType<typeof createThreadSchema> {}
export interface IReplyThread extends InferType<typeof replyThreadSchema> {}

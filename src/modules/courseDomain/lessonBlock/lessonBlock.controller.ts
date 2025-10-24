import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate } from "../../../common/utils/validation";
import { lessonBlockService } from "./lessonBlock.service";
import { createLessonBlockSchema, updateLessonBlockSchema } from "./lessonBlock.validation";

const list: AsyncRequestHandler = async (req, res) => {
  const blocks = await lessonBlockService.list(req.lesson!.id);
  res.status(200).json({ data: blocks });
};

const detail: AsyncRequestHandler = async (req, res) => {
  const block = await lessonBlockService.find(req.block!.id);
  res.status(200).json({ data: block });
};

const create: AsyncRequestHandler = async (req, res) => {
  const payload = await validate(createLessonBlockSchema, req.body);
  const block = await lessonBlockService.create(payload, req.lesson!.id);
  res.status(201).json({ data: block });
};

const update: AsyncRequestHandler = async (req, res) => {
  const payload = await validate(updateLessonBlockSchema, req.body);
  const block = await lessonBlockService.update(payload, req.block!.id);
  res.status(200).json({ data: block });
};

const remove: AsyncRequestHandler = async (req, res) => {
  const block = await lessonBlockService.remove(req.block!.id);
  res.status(200).json({ data: { removedId: block.id, message: "Lesson block removed" } });
};

export const lessonBlockController = {
  list: asyncHandler(list),
  detail: asyncHandler(detail),
  create: asyncHandler(create),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
};

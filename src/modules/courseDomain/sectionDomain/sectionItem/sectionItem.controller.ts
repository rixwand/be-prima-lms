import { AsyncRequestHandler, asyncHandler } from "../../../../common/utils/http";
import { validate } from "../../../../common/utils/validation";
import { sectionItemService } from "./sectionItem.service";
import {
  createSectionItemSchema,
  deleteManySectionItemsSchema,
  reorderSectionItemsSchema,
  updateSectionItemLessonSchema,
} from "./sectionItem.validation";

const list: AsyncRequestHandler = async (req, res) => {
  const items = await sectionItemService.list(req.section?.id!);
  res.status(200).json({ data: items });
};

const create: AsyncRequestHandler = async (req, res) => {
  const payload = await validate(createSectionItemSchema, req.body);
  const count = await sectionItemService.createMany(payload, req.section?.id!);
  res.status(200).json({ data: { message: `success add ${count} item${count > 1 ? "s" : ""}` } });
};

const update: AsyncRequestHandler = async (req, res) => {
  const payload = await validate(updateSectionItemLessonSchema, req.body);
  const data = await sectionItemService.update(req.sectionItem?.id!, payload);
  res.status(200).json({ data });
};

const remove: AsyncRequestHandler = async (req, res) => {
  await sectionItemService.remove({ ...req.sectionItem! });
  res.status(200).json({ data: { removedId: req.sectionItem?.id!, message: `success remove section item` } });
};

const removeMany: AsyncRequestHandler = async (req, res) => {
  const ids = new Set((await validate(deleteManySectionItemsSchema, req.body)).ids);
  const { count } = await sectionItemService.removeMany({ ids: Array.from(ids), sectionId: req.section?.id! });
  res.status(200).json({ data: { message: `success remove ${count} item${count > 1 ? "s" : ""}` } });
};

const reorder: AsyncRequestHandler = async (req, res) => {
  const { reorders } = await validate(reorderSectionItemsSchema, req.body);
  const { newOrder } = await sectionItemService.reorder(req.section?.id!, reorders);
  res.status(200).json({ data: { newOrder } });
};

export const sectionItemController = {
  list: asyncHandler(list),
  create: asyncHandler(create),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
  removeMany: asyncHandler(removeMany),
  reorder: asyncHandler(reorder),
};

import { AsyncRequestHandler, asyncHandler } from "../../../common/utils/http";
import { validate, validateIdParams } from "../../../common/utils/validation";
import { courseCategoryService } from "./courseCategories.service";
import {
  createCategorySchema,
  createManyCategorySchema,
  deleteManyCategorySchema,
  listCategoryParams,
  updateCategorySchema,
} from "./courseCategories.validation";

const create: AsyncRequestHandler = async (req, res) => {
  const payload = await validate(createCategorySchema, req.body);
  const data = await courseCategoryService.create(payload);
  res.status(200).json({ data });
};

const createMany: AsyncRequestHandler = async (req, res) => {
  const body = await validate(createManyCategorySchema, req.body);
  const data = await courseCategoryService.createMany(body);
  res.status(200).json({ data });
};

const update: AsyncRequestHandler = async (req, res) => {
  const { id } = await validateIdParams(req.params.id);
  const category = await validate(updateCategorySchema, req.body);
  const data = await courseCategoryService.update(id, category);
  res.status(200).json({ data });
};

const remove: AsyncRequestHandler = async (req, res) => {
  const { id } = await validateIdParams(req.params.id);
  const data = await courseCategoryService.delete(id);
  res.status(200).json({ data });
};

const removeMany: AsyncRequestHandler = async (req, res) => {
  const { ids } = await validate(deleteManyCategorySchema, req.body);
  const data = await courseCategoryService.deleteMany(ids);
  res.status(200).json({ data });
};

const list: AsyncRequestHandler = async (req, res) => {
  const params = await validate(listCategoryParams, req.query);
  const result = await courseCategoryService.list(params);
  res.status(200).json({ data: result });
};

const get: AsyncRequestHandler = async (req, res) => {
  const { id } = await validateIdParams(req.params.id);
  const data = await courseCategoryService.get(id);
  res.status(200).json({ data });
};

export const courseCategoryController = {
  create: asyncHandler(create),
  createMany: asyncHandler(createMany),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
  removeMany: asyncHandler(removeMany),
  list: asyncHandler(list),
  get: asyncHandler(get),
};

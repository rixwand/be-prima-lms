import { Prisma } from "@prisma/client";
import { lessonBlockRepo } from "./lessonBlock.repository";
import { ILessonBlockCreate, ILessonBlockUpdate } from "./lessonBlock.types";

const toNullableJsonValue = (value: unknown | null | undefined) => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.DbNull;
  return value as Prisma.InputJsonValue;
};

export const lessonBlockService = {
  async list(lessonId: number) {
    return lessonBlockRepo.list(lessonId);
  },

  async find(id: number) {
    return lessonBlockRepo.findById(id);
  },

  async create(block: ILessonBlockCreate, lessonId: number) {
    const { _max } = await lessonBlockRepo.getMaxPosition(lessonId);
    const nextPosition = (_max.position ?? 0) + 1;
    const payload: Prisma.LessonBlockUncheckedCreateInput = {
      lessonId,
      position: nextPosition,
      type: block.type,
    };
    const textJson = toNullableJsonValue(block.textJson);
    if (textJson !== undefined) payload.textJson = textJson;
    if (block.url !== undefined) payload.url = block.url;
    const meta = toNullableJsonValue(block.meta);
    if (meta !== undefined) payload.meta = meta;
    return lessonBlockRepo.create(payload);
  },

  async update(block: ILessonBlockUpdate, id: number) {
    const data: Prisma.LessonBlockUncheckedUpdateInput = {};
    if (block.type !== undefined) data.type = block.type;
    if (block.url !== undefined) data.url = block.url;
    const textJson = toNullableJsonValue(block.textJson);
    if (textJson !== undefined) data.textJson = textJson;
    const meta = toNullableJsonValue(block.meta);
    if (meta !== undefined) data.meta = meta;
    return lessonBlockRepo.update(data, id);
  },

  async remove(id: number) {
    return lessonBlockRepo.remove(id);
  },
};

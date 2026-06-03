import * as yup from "yup";
import { sectionItemSchema } from "../sectionItem/sectionItem.validation";
export const createSectionSchema = yup
  .object({
    arrayTitle: yup.array().of(yup.string().required()).min(1).required(),
  })
  .noUnknown()
  .required();

export const createSectionsWithLessonsSchema = yup
  .object({
    sections: yup
      .array()
      .of(
        yup
          .object({
            title: yup.string().required(),
            isPublished: yup.boolean().optional().default(false),
            items: yup
              .array()
              .of(
                sectionItemSchema
                  .concat(
                    yup
                      .object({
                        isPublished: yup.boolean().optional().default(false),
                      })
                      .required()
                      .noUnknown(),
                  )
                  .required(),
              )
              .min(1)
              .optional(),
          })
          .required()
          .noUnknown(),
      )
      .min(1)
      .required(),
  })
  .noUnknown()
  .required();

export const updateSectionSchema = yup
  .object({
    title: yup.string().required(),
  })
  .noUnknown()
  .required();

const reorderExistingSectionSchema = yup
  .object({
    id: yup.number().integer().positive().required(),
    position: yup.number().integer().positive().required(),
  })
  .required()
  .noUnknown(true);

const reorderNewSectionSchema = yup
  .object({
    position: yup.number().integer().positive().required(),
    title: yup.string().required(),
    items: yup.array().of(sectionItemSchema).optional(),
  })
  .test("no-id-field", "New sections must not include an id", value => {
    const candidate = value as { id?: unknown } | undefined;
    return candidate?.id === undefined;
  })
  .required()
  .noUnknown(true);

export const reorderCourseSectionsSchema = yup
  .object({
    reorders: yup
      .array()
      .of(
        yup.lazy(value =>
          value && value.id !== undefined && value.id !== null ? reorderExistingSectionSchema : reorderNewSectionSchema,
        ),
      )
      .test("unique-ids", "Duplicate section ids are not allowed", reorders => {
        if (!Array.isArray(reorders)) return true;
        const ids = reorders
          .map(item => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return undefined;
            const id = (item as { id?: unknown }).id;
            return typeof id === "number" ? id : undefined;
          })
          .filter((id): id is number => typeof id === "number");
        return ids.length === new Set(ids).size;
      })
      .test("unique-positions", "Duplicate positions are not allowed", reorders => {
        if (!Array.isArray(reorders)) return true;
        const positions = reorders.map(item => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return Number.NaN;
          return Number((item as { position?: unknown }).position);
        });
        return positions.length === new Set(positions).size;
      })
      .min(1, "At least one reorder item is required")
      .required(),
  })
  .noUnknown()
  .required();

export const deleteManyCourseSectionsSchema = yup
  .object({
    ids: yup
      .array()
      .of(yup.number().integer().positive().required())
      .min(1, "At least one id must be provided")
      .required("ids field is required"),
  })
  .noUnknown()
  .required();

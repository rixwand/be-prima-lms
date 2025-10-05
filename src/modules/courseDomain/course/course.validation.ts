import * as yup from "yup";
import { slugify } from "../../../common/utils/course";
const DiscountTypes = ["FIXED", "PERCENTAGE"] as const;
type DiscountType = (typeof DiscountTypes)[number];
export const createCourseSchema = yup.object({
  title: yup.string().required(),
  status: yup.mixed<"PUBLISHED" | "DRAFT">().oneOf(["PUBLISHED", "DRAFT"]).optional(),
  coverImage: yup.string().required(),
  previewVideo: yup.string().optional(),
  shortDescription: yup.string().required(),
  descriptionJson: yup.string().optional(),
  priceAmount: yup.number().required(),
  isFree: yup.boolean().optional().default(false),
  tags: yup.array().of(yup.string().trim().required()).min(1).required(),
  sections: yup
    .array(
      yup.object({
        title: yup.string().required(),
        lessons: yup
          .array(
            yup.object({
              title: yup.string().required(),
              summary: yup.string().optional(),
              durationSec: yup.number().optional(),
              isPreview: yup.boolean().default(false).optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  discount: yup
    .object({
      type: yup.mixed<DiscountType>().defined().oneOf(DiscountTypes).required(),
      value: yup
        .number()
        .required()
        .when("type", {
          is: "PERCENTAGE",
          then: s => s.min(0).max(100),
          otherwise: s => s.positive(),
        }),
      label: yup.string().optional(),
      isActive: yup.boolean().default(true).optional(),
      startAt: yup.date().min(new Date(), "must be equal or greater than the current time").optional(),
      endAt: yup.date().optional(),
    })
    .optional()
    .default(undefined),
});

export const updateCourseSchema = yup
  .object({
    title: yup.string().optional(),
    status: yup.mixed<"PUBLISHED" | "DRAFT">().oneOf(["PUBLISHED", "DRAFT"]).optional(),
    coverImage: yup.string().optional(),
    previewVideo: yup.string().optional(),
    shortDescription: yup.string().optional(),
    descriptionJson: yup.string().optional(),
    priceAmount: yup.number().optional(),
    isFree: yup.boolean().optional().default(false),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    value => value != null && Object.keys(value).length > 0
  );

export const updateCourseTagsSchema = yup
  .object({
    disconnectSlugs: yup.array().of(yup.string().trim().required()).optional(),
    createOrConnect: yup.array().of(yup.string().trim().required()).optional(),
  })
  .test(
    "at-least-one",
    "Provide at least one of disconnectSlugs or createOrConnect.",
    v => !!v && (v.disconnectSlugs?.length ?? 0) + (v.createOrConnect?.length ?? 0) > 0
  )
  .test("no-overlap", "Overlapping tags: a tag slated for creation also appears in disconnectSlugs.", v => {
    if (!v) return true;
    const { createOrConnect = [], disconnectSlugs = [] } = v;
    if (!createOrConnect.length || !disconnectSlugs.length) return true;
    const toRemove = new Set(disconnectSlugs.map(s => s.trim().toLowerCase()));
    const overlap = createOrConnect.map(name => slugify(name)).some(slug => toRemove.has(slug));
    return !overlap;
  })
  .test("uniq-disconnect-ci", "disconnectSlugs must be unique (case-insensitive).", v => {
    if (!v?.disconnectSlugs) return true;
    const arr = v.disconnectSlugs.map(s => s.trim().toLowerCase());
    return new Set(arr).size === arr.length;
  })
  .test("uniq-create-ci", "createOrConnect must be unique (case-insensitive).", v => {
    if (!v?.createOrConnect) return true;
    const arr = v.createOrConnect.map(s => s.trim().toLowerCase());
    return new Set(arr).size === arr.length;
  })
  .noUnknown();

export const deleteManyCourseSchema = yup.object({
  ids: yup
    .array()
    .of(yup.number().integer().positive().required())
    .min(1, "At least one id must be provided")
    .required("ids field is required"),
});

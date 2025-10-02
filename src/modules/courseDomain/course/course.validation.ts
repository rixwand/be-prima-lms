import * as yup from "yup";
import { slugify } from "../../../common/utils/course";

export const createCourseSchema = yup.object({
  title: yup.string().required(),
  status: yup.mixed<"PUBLISHED" | "DRAFT">().oneOf(["PUBLISHED", "DRAFT"]).optional(),
  coverImage: yup.string().required(),
  previewVideo: yup.string().optional(),
  shortDescription: yup.string().required(),
  descriptionJson: yup.string().optional(),
  priceCurrency: yup.string().optional().default("IDR"),
  priceAmount: yup.number().required(),
  isFree: yup.boolean().optional().default(false),
  tags: yup.array().of(yup.string().trim().required()).min(1).required(),
});

export const updateCourseSchema = yup
  .object({
    title: yup.string().optional(),
    status: yup.mixed<"PUBLISHED" | "DRAFT">().oneOf(["PUBLISHED", "DRAFT"]).optional(),
    coverImage: yup.string().optional(),
    previewVideo: yup.string().optional(),
    shortDescription: yup.string().optional(),
    descriptionJson: yup.string().optional(),
    priceCurrency: yup.string().optional().default("IDR"),
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

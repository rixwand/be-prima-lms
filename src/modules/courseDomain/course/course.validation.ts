import { $Enums } from "@prisma/client";
import * as yup from "yup";
import { slugify } from "../../../common/utils/course";
import { COURSE_STATUS, CourseStatus } from "./course.types";

const DISCOUNT_TYPES = Object.values($Enums.DiscountType) as readonly $Enums.DiscountType[];

const courseCategoriesScema = yup
  .object({
    ids: yup.array().of(yup.number().required()).min(1).max(3).required(),
    primaryId: yup.number().required(),
  })
  .test({
    name: "invalid primaryId",
    message: `"primaryId" must be included in "ids"`,
    test: v => v.ids.includes(v.primaryId),
  })
  .noUnknown()
  .required();

export const updateCourseCategoriesSchema = yup
  .object({
    newCategories: courseCategoriesScema,
  })
  .noUnknown()
  .required();

export const createCourseSchema = yup
  .object({
    title: yup.string().required(),
    coverImage: yup.string().required(),
    previewVideo: yup.string().optional(),
    shortDescription: yup.string().required(),
    descriptionJson: yup.string().optional(),
    priceAmount: yup.number().required(),
    isFree: yup.boolean().optional().default(false),
    tags: yup.array().of(yup.string().trim().required().max(25)).min(1).required(),
    categories: courseCategoriesScema,
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
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    discount: yup
      .object({
        type: yup.mixed<$Enums.DiscountType>().defined().oneOf(DISCOUNT_TYPES).required(),
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
        endAt: yup.date().min(new Date(), "must be equal or greater than the current time").optional(),
      })
      .optional()
      .default(undefined),
  })
  .noUnknown()
  .required();

export const updateCourseSchema = yup
  .object({
    title: yup.string().optional(),
    coverImage: yup.string().optional(),
    previewVideo: yup.string().optional(),
    shortDescription: yup.string().optional(),
    descriptionJson: yup.string().optional(),
    priceAmount: yup.number().optional(),
    isFree: yup.boolean().optional(),
    discounts: yup
      .array()
      .of(
        yup.object({
          id: yup.number().integer().positive().optional(),
          type: yup.mixed<$Enums.DiscountType>().defined().oneOf(DISCOUNT_TYPES).optional(),
          value: yup
            .number()
            .optional()
            .when("type", {
              is: "PERCENTAGE",
              then: s => s.min(0).max(100),
              otherwise: s => s.positive(),
            }),
          label: yup.string().optional(),
          isActive: yup.boolean().default(true).optional(),
          startAt: yup.date().min(new Date(), "must be equal or greater than the current time").optional(),
          endAt: yup.date().min(new Date(), "must be equal or greater than the current time").optional(),
        }),
      )
      .optional(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    value => value != null && Object.keys(value).length > 0,
  )
  .noUnknown()
  .required();

export const updateCourseTagsSchema = yup
  .object({
    disconnectSlugs: yup.array().of(yup.string().trim().required().max(25)).optional(),
    createOrConnect: yup.array().of(yup.string().trim().required().max(25)).optional(),
  })
  .test(
    "at-least-one",
    "Provide at least one of disconnectSlugs or createOrConnect.",
    v => !!v && (v.disconnectSlugs?.length ?? 0) + (v.createOrConnect?.length ?? 0) > 0,
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
  .required()
  .noUnknown();

export const deleteManyCourseSchema = yup
  .object({
    ids: yup
      .array()
      .of(yup.number().integer().positive().required())
      .min(1, "At least one id must be provided")
      .required("ids field is required"),
  })
  .noUnknown()
  .required();

export const listMyCoursesParamsSchema = yup
  .object({
    status: yup.mixed<CourseStatus>().oneOf(COURSE_STATUS).optional(),
    page: yup.number().integer().positive().default(1).optional(),
    limit: yup.number().integer().positive().default(10).optional(),
    startDate: yup.date().optional(),
    endDate: yup.date().optional(),
    search: yup.string().optional(),
  })
  .noUnknown();

export const listPublicCoursesParamsSchema = yup
  .object({
    tagSlugs: yup.array(yup.string().required().max(25)).optional(),
    categories: yup.array(yup.string().required().max(25)).optional(),
    search: yup.string().optional(),
    isFree: yup.boolean().optional().default(false),
    page: yup.number().integer().positive().default(1).optional(),
    limit: yup.number().integer().positive().default(12).optional(),
  })
  .noUnknown();

export const listPublicTagsParamsSchema = yup
  .object({
    search: yup.string().optional(),
    page: yup.number().integer().positive().default(1).optional(),
    limit: yup.number().integer().positive().default(10).optional(),
  })
  .noUnknown();

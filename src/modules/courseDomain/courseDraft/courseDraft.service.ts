import { Decimal } from "@prisma/client/runtime/library";
import { slugify } from "../../../common/utils/course";
import { definedKeys, optionalizeUndefined } from "../../../common/utils/function";
import { courseRepo } from "../course/course.repository";
import {
  ICourseCategoriesCreateEntity,
  ICourseCreate,
  ICourseUpdate,
  ICourseUpdateTags,
  MetaApprovedPayload,
} from "../course/course.types";
import { IUpdateDiscount } from "../courseDiscountDraft/courseDiscount.types";
import categoriesDraftRepository from "./categoriesDraft.repository";
import { discountDraftRepo } from "./discountDraft.repository";
import courseDraftRepo from "./metaDraft.repository";
import tagDraftRepository from "./tagDraft.repository";

export default {
  async create(course: ICourseCreate, ownerId: number) {
    const { discount, tags, sections, categories, ...courseData } = course;
    console.log();
    return courseRepo.create({
      course: {
        ...courseData,
        ownerId,
        slug: slugify(courseData.title),
      },
      tags,
      categories,
      sections,
      discount: discount ? optionalizeUndefined(discount) : undefined,
    });
  },

  async updateDraft({ course, draftId, courseId }: { course: ICourseUpdate; draftId: number; courseId: number }) {
    const { discounts, ...courseData } = course;
    const metaApproved = (await courseRepo.getApprovedMeta(courseId)) as MetaApprovedPayload;
    const approvedDiscounts = await courseRepo.getApprovedDiscount(courseId);
    let requiresApproval = computeRequiresAppropalMeta({ input: courseData, metaApproved });
    const data = optionalizeUndefined(courseData);
    if (discounts && discounts.length > 0) {
      await Promise.all(
        discounts.map(async discount => {
          await discountDraftRepo.upsert({ discount: discount as IUpdateDiscount, draftId });
        }),
      );
      const updatedDraftDiscount = await discountDraftRepo.get(draftId);
      requiresApproval = requiresApproval || !sameDiscounts(updatedDraftDiscount, approvedDiscounts);
    }
    return courseDraftRepo.updateMeta(
      {
        ...data,
        requiresApproval,
      },
      draftId,
    );
  },

  async updateDraftTags({
    draftId,
    tagObj,
    courseId,
  }: {
    tagObj: ICourseUpdateTags;
    draftId: number;
    courseId: number;
  }) {
    const { createOrConnect, disconnectSlugs } = tagObj;
    let removed = 0;
    if (disconnectSlugs && disconnectSlugs.length > 0) {
      const { count } = await tagDraftRepository.disconnectBySlug(disconnectSlugs, draftId);
      removed = +count;
    }
    let added = 0;
    if (createOrConnect && createOrConnect.length > 0) {
      await tagDraftRepository.connectOrCreate(createOrConnect, draftId);
      added = +createOrConnect.length;
    }
    if (removed + added > 0) {
      const approvedTags = await courseRepo.getApprovedTags(courseId);
      const draftTags = await tagDraftRepository.getCourseDraftTags(draftId);
      if (!sameBy(approvedTags, draftTags, tag => tag.tagId)) {
        await courseDraftRepo.updateMeta({ requiresApproval: true }, draftId);
      }
    }
    return { message: `Success add ${added} tags and remove ${removed} tags` };
  },

  async updateCategories({
    categories,
    courseId,
    draftId,
  }: {
    draftId: number;
    categories: ICourseCategoriesCreateEntity;
    courseId: number;
  }) {
    const res = await courseRepo.updateDraftCategories(draftId, categories);
    const updatedDraft = await categoriesDraftRepository.getCategoriesDraft(draftId);
    const approved = await courseRepo.getApprovedCategories(courseId);
    console.log(approved, " equal ", updatedDraft, " = ", sameCategories(approved, updatedDraft));
    if (!sameCategories(approved, updatedDraft)) {
      await courseDraftRepo.updateMeta({ requiresApproval: true }, draftId);
    }
    return res;
  },

  async removeDiscount(props: { id: number; draftId: number }) {
    return discountDraftRepo.remove(props);
  },
};

const computeRequiresAppropalMeta = ({
  input,
  metaApproved,
}: {
  metaApproved?: MetaApprovedPayload;
  input: Omit<ICourseUpdate, "discounts">;
}) => {
  if (!metaApproved) return false;
  const TIER_C_KEYS: (keyof MetaApprovedPayload)[] = ["priceAmount", "isFree"];

  return definedKeys(input)
    .filter(k => TIER_C_KEYS.includes(k))
    .some(k => input[k] !== metaApproved[k]);
};

type DiscountComparable = {
  type: string;
  value: Decimal;
  startAt?: Date | null;
  endAt?: Date | null;
  label?: string | null;
};

function normalizeDiscount(d: DiscountComparable) {
  return {
    type: d.type,
    value: d.value,
    startAt: d.startAt ?? null,
    endAt: d.endAt ?? null,
    label: d.label ?? null,
  };
}

function sameDiscounts(a: DiscountComparable[], b: DiscountComparable[]) {
  if (a.length !== b.length) return false;

  const norm = (x: DiscountComparable[]) =>
    x.map(normalizeDiscount).sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));

  const A = norm(a);
  const B = norm(b);

  return A.every((v, i) => JSON.stringify(v) === JSON.stringify(B[i]));
}

function sameBy<T, K>(a: T[], b: T[], key: (item: T) => K) {
  if (a.length !== b.length) return false;

  const s = new Set(a.map(key));
  return b.every(x => s.has(key(x)));
}

function sameCategories<T extends { categoryId: number; isPrimary: boolean }>(a: T[], b: T[]) {
  if (a.length !== b.length) return false;

  const key = (x: T) => `${x.categoryId}:${x.isPrimary}`;
  const s = new Set(a.map(key));

  return b.every(x => s.has(key(x)));
}

import type { NextFunction, Request, Response } from "express";
import { prisma } from "../common/libs/prisma";
import { getCourseStatus } from "../common/utils/course";
import { validateIdParams, validateSlugParams } from "../common/utils/validation";
import { AUTH } from "../config";
import { courseRepo } from "../modules/courseDomain/course/course.repository";

type Level = "course" | "section" | "sectionItem";

export const requireCourseEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("requireCourseEnrollment slug: ", req.params.courseSlug);
    const { slug } = await validateSlugParams(req.params.courseSlug);
    console.log("slug: ", slug);
    const user = req.user;
    const course = await courseRepo.findEnrollmentBySlug(slug);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!course.enrollments.some(e => e.userId == user?.id!))
      return res.status(404).json({ error: "Enrollment not found" });
    req.course = { id: course.id };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCourseOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const courseId = (await validateIdParams(req.params.courseId)).id;

    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    // TODO: if user role is member fetch into enrollment instead
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        metaDraft: { select: { id: true } },
        ownerId: true,
        publishRequest: { select: { id: true, status: true } },
        publishedAt: true,
        takenDownAt: true,
      },
    });

    // TODO: if course.takenDownAt then block user enrollment

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.authz?.scopes.includes(AUTH.SCOPES.GLOBAL) && course.publishRequest) {
      req.course = {
        id: courseId,
        ownerId: course.ownerId,
        status: getCourseStatus(course),
        draftId: course.metaDraft?.id!,
      };
      return next();
    }

    if (course.ownerId !== user?.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    console.log("course in middlware: ", course);

    req.course = {
      id: courseId,
      ownerId: course.ownerId,
      status: getCourseStatus(course),
      draftId: course.metaDraft?.id!,
    };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireHierarcy = (level: Level) => async (req: Request, res: Response, next: NextFunction) => {
  const isAdmin = req.authz?.scopes.includes(AUTH.SCOPES.GLOBAL);
  try {
    const courseId = (await validateIdParams(req.params.courseId)).id;
    const sectionId = level !== "course" ? (await validateIdParams(req.params.sectionId)).id : null;
    const itemId = level === "sectionItem" ? (await validateIdParams(req.params.itemId)).id : null;

    if (level === "course") {
      const course = await prisma.course.findFirst({
        where: { id: courseId, ...(!isAdmin && { ownerId: req.user?.id! }) },
        select: { id: true, ownerId: true, metaDraft: { select: { id: true } }, publishedAt: true },
      });
      if (!course) return notFound(res, "Course not found or not owned");
      req.course = {
        id: course.id,
        draftId: course.metaDraft?.id!,
        ownerId: course.ownerId,
        publishedAt: course.publishedAt,
        status: getCourseStatus(course),
      };
      return next();
    }

    if (level === "section") {
      const section = await prisma.courseSection.findFirst({
        where: {
          id: sectionId!,
          course: { id: courseId, ...(!isAdmin && { ownerId: req.user?.id! }) },
        },
        select: {
          id: true,
          courseId: true,
          course: { select: { id: true, ownerId: true, publishedAt: true } },
          publishedAt: true,
        },
      });
      if (!section) return notFound(res, "Section not found in this course or not owned");
      req.section = { id: section.id, courseId: section.courseId, publishedAt: section.publishedAt };
      req.course = {
        id: section.course.id,
        ownerId: section.course.ownerId,
        publishedAt: section.course.publishedAt,
        status: getCourseStatus(section.course),
      };
      return next();
    }

    // if (level === "lesson") {
    const sectionItem = await prisma.sectionItem.findFirst({
      where: {
        id: itemId!,
        section: { id: sectionId!, course: { id: courseId, ...(!isAdmin && { ownerId: req.user?.id! }) } },
      },
      select: {
        id: true,
        sectionId: true,
        section: {
          select: {
            id: true,
            courseId: true,
            course: { select: { id: true, ownerId: true, publishedAt: true } },
            publishedAt: true,
          },
        },
        publishedAt: true,
      },
    });
    // itemId !== null
    //   ? await sectionItemRepo.findSectionItemHierarchyByItemId({
    //       courseId,
    //       sectionId: sectionId!,
    //       itemId,
    //       ...(!isAdmin ? { ownerId: req.user?.id! } : {}),
    //     })
    //   : await sectionItemRepo.findSectionItemHierarchyByEntityId({
    //       courseId,
    //       sectionId: sectionId!,
    //       entityId: lessonId!,
    //       ...(!isAdmin ? { ownerId: req.user?.id! } : {}),
    //     });
    if (!sectionItem) return notFound(res, "Lesson not found in this section/course or not owned");
    req.sectionItem = {
      id: sectionItem.id,
      sectionId: sectionItem.sectionId,
      publishedAt: sectionItem.publishedAt,
    };
    req.section = {
      id: sectionItem.section.id,
      courseId: sectionItem.section.courseId,
      publishedAt: sectionItem.section.publishedAt,
    };
    req.course = {
      id: sectionItem.section.course.id,
      ownerId: sectionItem.section.course.ownerId,
      publishedAt: sectionItem.section.course.publishedAt,
      status: getCourseStatus(sectionItem.section.course),
    };
    //   return next();
    // }

    // level === "block"
    // const block = await prisma.lessonBlock.findFirst({
    //   where: {
    //     id: blockId!,
    //     lesson: {
    //       id: lessonId!,
    //       section: { id: sectionId!, course: { id: courseId, ...(!isAdmin && { ownerId: req.user?.id! }) } },
    //     },
    //   },
    //   select: {
    //     id: true,
    //     lessonId: true,
    //     lesson: {
    //       select: {
    //         id: true,
    //         sectionId: true,
    //         section: {
    //           select: {
    //             id: true,
    //             courseId: true,
    //             course: { select: { id: true, ownerId: true } },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // if (!block) return notFound(res, "Lesson block not found in this hierarchy or not owned");

    // req.block = { id: block.id, lessonId: block.lessonId };
    // req.lesson = { id: block.lesson.id, sectionId: block.lesson.sectionId };
    // req.section = { id: block.lesson.section.id, courseId: block.lesson.section.courseId };
    // req.course = { id: block.lesson.section.course.id, ownerId: block.lesson.section.course.ownerId };

    next();
  } catch (error) {
    next(error);
  }
};

const notFound = (res: any, msg: string) => res.status(404).json({ error: msg });

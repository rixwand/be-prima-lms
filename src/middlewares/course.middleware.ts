import type { NextFunction, Request, Response } from "express";
import { prisma } from "../common/libs/prisma";
import { getCourseStatus } from "../common/utils/course";
import { validateIdParams, validateSlugParams } from "../common/utils/validation";
import { AUTH } from "../config";
import { courseRepo } from "../modules/courseDomain/course/course.repository";

type Level = "course" | "section" | "lesson";

export const requireCourseEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("requireCourseEnrollment slug: ", req.params.courseSlug);
    const { slug } = await validateSlugParams(req.params.courseSlug);
    console.log("slug: ", slug);
    const user = req.user;
    const course = await courseRepo.findEnrollmentBySlug(slug);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.enrollments.some(e => e.userId == user?.id!))
      return res.status(404).json({ message: "Enrollment not found" });
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
      return res.status(400).json({ message: "Invalid courseId" });
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
      return res.status(404).json({ message: "Course not found" });
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
      return res.status(403).json({ message: "Forbidden" });
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
    const lessonId = level === "lesson" ? (await validateIdParams(req.params.lessonId)).id : null;

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
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId!,
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
    if (!lesson) return notFound(res, "Lesson not found in this section/course or not owned");
    req.lesson = { id: lesson.id, sectionId: lesson.sectionId, publishedAt: lesson.publishedAt };
    req.section = { id: lesson.section.id, courseId: lesson.section.courseId, publishedAt: lesson.section.publishedAt };
    req.course = {
      id: lesson.section.course.id,
      ownerId: lesson.section.course.ownerId,
      publishedAt: lesson.section.course.publishedAt,
      status: getCourseStatus(lesson.section.course),
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

const notFound = (res: any, msg: string) => res.status(404).json({ message: msg });

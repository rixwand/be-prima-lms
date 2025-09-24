import type { NextFunction, Request, Response } from "express";
import { prisma } from "../common/libs/prisma";
import { validateIdParams } from "../common/utils/validation";

type Level = "course" | "section" | "lesson" | "block";

export const requireCourseOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const courseId = Number(req.params.courseId);

    if (!Number.isFinite(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, ownerId: true },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.ownerId !== user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("course in middlware: ", course);

    req.course = course;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireHierarcy = (level: Level) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = (await validateIdParams(req.params.courseId)).id;
    const sectionId = level !== "course" ? (await validateIdParams(req.params.sectionId)).id : null;
    const lessonId = level === "lesson" || level === "block" ? (await validateIdParams(req.params.lessonId)).id : null;
    const blockId = level === "block" ? (await validateIdParams(req.params.blockId)).id : null;

    if (level === "course") {
      const course = await prisma.course.findFirst({
        where: { id: courseId, ownerId: req.user?.id! },
        select: { id: true, ownerId: true },
      });
      if (!course) return notFound(res, "Course not found or not owned");
      req.course = course;
      return next();
    }

    if (level === "section") {
      const section = await prisma.courseSection.findFirst({
        where: {
          id: sectionId!,
          course: { id: courseId, ownerId: req.user?.id! },
        },
        select: {
          id: true,
          courseId: true,
          course: { select: { id: true, ownerId: true } },
        },
      });
      if (!section) return notFound(res, "Section not found in this course or not owned");
      req.section = { id: section.id, courseId: section.courseId };
      req.course = { id: section.course.id, ownerId: section.course.ownerId };
      return next();
    }

    if (level === "lesson") {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId!,
          section: { id: sectionId!, course: { id: courseId, ownerId: req.user?.id! } },
        },
        select: {
          id: true,
          sectionId: true,
          section: {
            select: {
              id: true,
              courseId: true,
              course: { select: { id: true, ownerId: true } },
            },
          },
        },
      });
      if (!lesson) return notFound(res, "Lesson not found in this section/course or not owned");
      req.lesson = { id: lesson.id, sectionId: lesson.sectionId };
      req.section = { id: lesson.section.id, courseId: lesson.section.courseId };
      req.course = { id: lesson.section.course.id, ownerId: lesson.section.course.ownerId };
      return next();
    }

    // level === "block"
    const block = await prisma.lessonBlock.findFirst({
      where: {
        id: blockId!,
        lesson: {
          id: lessonId!,
          section: { id: sectionId!, course: { id: courseId, ownerId: req.user?.id! } },
        },
      },
      select: {
        id: true,
        lessonId: true,
        lesson: {
          select: {
            id: true,
            sectionId: true,
            section: {
              select: {
                id: true,
                courseId: true,
                course: { select: { id: true, ownerId: true } },
              },
            },
          },
        },
      },
    });

    if (!block) return notFound(res, "Lesson block not found in this hierarchy or not owned");

    req.block = { id: block.id, lessonId: block.lessonId };
    req.lesson = { id: block.lesson.id, sectionId: block.lesson.sectionId };
    req.section = { id: block.lesson.section.id, courseId: block.lesson.section.courseId };
    req.course = { id: block.lesson.section.course.id, ownerId: block.lesson.section.course.ownerId };

    next();
  } catch (error) {
    next(error);
  }
};

const notFound = (res: any, msg: string) => res.status(404).json({ message: msg });

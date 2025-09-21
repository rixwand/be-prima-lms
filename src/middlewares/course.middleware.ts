import type { NextFunction, Request, Response } from "express";
import { prisma } from "../common/libs/prisma";

const requireCourseOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    console.log("course middleware: ", req.url);
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

    req.course = course;
    next();
  } catch (err) {
    next(err);
  }
};

export default requireCourseOwnership;

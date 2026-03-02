import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import myCourse from "../modules/courseDomain/course/course.me.routes";
import courseCategoryRoutes from "../modules/courseDomain/courseCategories/courseCategories.routes";
import coursePublishRoutes from "../modules/courseDomain/coursePublish/coursePublish.routes";
import courseSectionRoutes from "../modules/courseDomain/courseSection/courseSection.routes";
import enrollmentRoutes from "../modules/courseDomain/enrollment/enrollment.routes";
import learnRoutes from "../modules/courseDomain/learn/learn.routes";
import lessonRoutes from "../modules/courseDomain/lesson/lesson.routes";
import orderRoutes from "../modules/order/order.routes";
import paymentRoutes from "../modules/payment/payment.routes";
import userRoutes from "../modules/users/users.routes";

const api = Router();

api.use(authMiddleware);
api.use("/user", userRoutes);
api.use("/me/courses", myCourse);
api.use("/me/courses/:courseId/sections", courseSectionRoutes);
api.use("/me/courses/:courseId/sections/:sectionId/lessons", lessonRoutes);
api.use("/me/enrollments", enrollmentRoutes);
api.use("/me/learn/:courseSlug", learnRoutes);
api.use("/courses/publish-requests", coursePublishRoutes);
api.use("/course-categories", courseCategoryRoutes);
api.use("/payment", paymentRoutes);
api.use("/order", orderRoutes);
export default api;

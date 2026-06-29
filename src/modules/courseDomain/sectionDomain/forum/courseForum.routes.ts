import { Router } from "express";
import { AUTH } from "../../../../config";
import { requireCourseForumAccess } from "../../../../middlewares/course.middleware";
import requirePermission from "../../../../middlewares/rbac.middleware";
import forumController from "./forum.controller";

const courseForumRoutes = Router({ mergeParams: true });

courseForumRoutes.post(
  "/thread",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.FORUM, { scope: [AUTH.SCOPES.OWN] }),
  requireCourseForumAccess,
  forumController.createThread,
);
courseForumRoutes.post(
  "/thread/:threadId/reply",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.FORUM, { scope: [AUTH.SCOPES.OWN] }),
  requireCourseForumAccess,
  forumController.replyThread,
);
courseForumRoutes.get(
  "/thread/:threadId/replies",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.FORUM, { scope: [AUTH.SCOPES.OWN] }),
  requireCourseForumAccess,
  forumController.getThreadReplies,
);
courseForumRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.FORUM, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireCourseForumAccess,
  forumController.getForumThreads,
);

export default courseForumRoutes;

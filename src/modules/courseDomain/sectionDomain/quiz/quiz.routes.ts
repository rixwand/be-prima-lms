import { Router } from "express";
import { AUTH } from "../../../../config";
import { requireHierarcy } from "../../../../middlewares/course.middleware";
import requirePermission from "../../../../middlewares/rbac.middleware";
import quizController from "./quiz.controller";

const quizRoutes = Router({
  mergeParams: true,
});

quizRoutes.patch(
  "/",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("sectionItem"),
  quizController.update,
);

quizRoutes.post(
  "/publish",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("sectionItem"),
  quizController.publish,
);

quizRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("sectionItem"),
  quizController.get,
);

quizRoutes.delete(
  "/question/deleteMany",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("sectionItem"),
  quizController.deleteManyQuestions,
);

quizRoutes.delete(
  "/question/:questionId",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("sectionItem"),
  quizController.deleteQuestion,
);

export default quizRoutes;

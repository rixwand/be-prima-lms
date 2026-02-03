import { CourseStatus } from "../modules/courseDomain/course/course.types";

export type RequestUser = { id: number; role_id: number };
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      authz?: {
        action: string;
        resource: string;
        scopes: string[];
      };
      course?: {
        id: number;
        draftId?: number;
        ownerId?: number;
        status?: CourseStatus;
        publishedAt?: Date | null;
      };
      section?: { id: number; courseId: number; publishedAt: Date | null };
      lesson?: { id: number; sectionId: number; publishedAt: Date | null };
    }
  }
}

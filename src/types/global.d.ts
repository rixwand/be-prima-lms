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
        ownerId?: number;
      };
      section?: { id: number; courseId: number };
      lesson?: { id: number; sectionId: number };
      block?: { id: number; lessonId: number };
    }
  }
}

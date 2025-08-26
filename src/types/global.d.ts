export type RequestUser = { id: number; role_id: number };
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

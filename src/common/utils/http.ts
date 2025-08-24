import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;
export function asyncHandler(fn: AsyncRequestHandler) {
  return function (req: any, res: any, next: any) {
    fn(req, res, next).catch(next);
  };
}

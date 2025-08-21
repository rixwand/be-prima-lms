export class ApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type AsyncFunction = (req: any, res: any, next: any) => Promise<any>;
export function asyncHandler(fn: AsyncFunction) {
  return function (req: any, res: any, next: any) {
    fn(req, res, next).catch(next);
  };
}

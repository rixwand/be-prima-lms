import { NextFunction, Request, Response } from "express";
import { userRepo } from "../modules/users/user.repository";

const requirePermission = (action: string, resource: string, opts?: { scope?: string }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const user = await userRepo.findById(req.user.id, {
        select: {
          roles: {
            select: {
              perms: {
                select: {
                  permission: {
                    select: { action: true, resource: true, scope: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!user?.roles) return res.status(401).json({ message: "Unauthorized" });
      const scopes = user.roles.perms
        .map(rp => rp.permission)
        .filter(p => p.action == action && p.resource == resource)
        .map(p => p.scope);
      if (scopes.length == 0) return res.status(403).json({ message: "Forbidden" });

      if (opts?.scope && !opts.scope.includes(opts.scope)) return res.status(403).json({ message: "Forbidden" });
      req.authz = { action, resource, scopes };
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default requirePermission;

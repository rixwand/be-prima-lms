import { NextFunction, Request, Response } from "express";
import { userRepo } from "../modules/users/user.repository";

const requirePermission = (action: string, resource: string, opts?: { scope?: string | string[] }) => {
  const allowedScopes = opts?.scope == null ? undefined : Array.isArray(opts.scope) ? opts.scope : [opts.scope];
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
      const permissions = user.roles.perms.map(rp => rp.permission);

      const allowed = permissions.some(p => {
        if (p.action !== action) return false;
        if (p.resource !== resource) return false;
        // if route defines scopes → must match one
        if (allowedScopes) {
          return allowedScopes.includes(p.scope);
        }

        // otherwise any scope is fine
        return true;
      });

      if (!allowed) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // expose matched scopes if needed downstream
      req.authz = {
        action,
        resource,
        scopes: permissions.filter(p => p.action === action && p.resource === resource).map(p => p.scope),
      };
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default requirePermission;

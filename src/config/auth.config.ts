export const AUTH = Object.freeze({
  SCOPES: {
    OWN: "own",
    GLOBAL: "global",
  },
  ROLES: {
    LECTURER: "lecturer",
    MEMBER: "member",
    ADMIN: "admin",
  },
  ACTIONS: {
    EDIT: "edit",
    VIEW: "view",
    CREATE: "create",
    DELETE: "delete",
    PUBLISH: "publish",
    MANAGE: "manage",
  },
  RESOURCES: {
    COURSE: "course",
    USER: "user",
  },
} as const);

export type AuthScope = (typeof AUTH.SCOPES)[keyof typeof AUTH.SCOPES];
export type AuthRole = (typeof AUTH.ROLES)[keyof typeof AUTH.ROLES];
export type AuthAction = (typeof AUTH.ACTIONS)[keyof typeof AUTH.ACTIONS];

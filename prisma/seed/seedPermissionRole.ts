import { PrismaClient } from "@prisma/client";
import { AUTH } from "../../src/config";

type PermissionDef = {
  action: string;
  resource: string;
  scope: string;
};

export default async function seedPermissionRoles(prisma: PrismaClient) {
  /**
   * 1. Create Roles
   */
  const roles = await Promise.all(
    Object.values(AUTH.ROLES).map(name =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

  /**
   * 2. Declare permissions per role (policy, not data)
   */
  const rolePolicies: Record<string, PermissionDef[]> = {
    [AUTH.ROLES.MEMBER]: [
      {
        action: AUTH.ACTIONS.VIEW,
        resource: AUTH.RESOURCES.COURSE,
        scope: AUTH.SCOPES.OWN,
      },
    ],

    [AUTH.ROLES.LECTURER]: [AUTH.ACTIONS.VIEW, AUTH.ACTIONS.CREATE, AUTH.ACTIONS.EDIT, AUTH.ACTIONS.DELETE].map(
      action => ({
        action,
        resource: AUTH.RESOURCES.COURSE,
        scope: AUTH.SCOPES.OWN,
      })
    ),
    // course (global)
    [AUTH.ROLES.ADMIN]: [
      ...[AUTH.ACTIONS.VIEW, AUTH.ACTIONS.CREATE, AUTH.ACTIONS.EDIT, AUTH.ACTIONS.PUBLISH].map(action => ({
        action,
        resource: AUTH.RESOURCES.COURSE,
        scope: AUTH.SCOPES.GLOBAL,
      })),

      {
        action: AUTH.ACTIONS.MANAGE,
        resource: AUTH.RESOURCES.USER,
        scope: AUTH.SCOPES.GLOBAL,
      },
    ],
  };

  /**
   * 3. Collect unique permissions
   */
  const permissionMap = new Map<string, PermissionDef>();

  for (const perms of Object.values(rolePolicies)) {
    for (const p of perms) {
      const key = `${p.action}:${p.resource}:${p.scope}`;
      permissionMap.set(key, p);
    }
  }

  const permissions = Array.from(permissionMap.values());

  /**
   * 4. Insert permissions
   */
  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });

  /**
   * 5. Fetch permission IDs
   */
  const dbPermissions = await prisma.permission.findMany();

  const permIdMap = new Map(dbPermissions.map(p => [`${p.action}:${p.resource}:${p.scope}`, p.id]));

  /**
   * 6. Assign permissions to roles
   */
  const rolePermissionData = Object.entries(rolePolicies).flatMap(([roleName, perms]) =>
    perms.map(p => ({
      roleId: roleMap[roleName]!,
      permissionId: permIdMap.get(`${p.action}:${p.resource}:${p.scope}`)!,
    }))
  );

  await prisma.rolePermission.createMany({
    data: rolePermissionData,
    skipDuplicates: true,
  });

  console.log("✅ Permissions auto-generated & seeded");
}

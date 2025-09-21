import type { PrismaClient } from "@prisma/client";

export default async function seedPermissionRoles(prisma: PrismaClient) {
  // 1. Create Roles
  const memberRole = await prisma.role.upsert({
    where: { name: "member" },
    update: {},
    create: { name: "member" },
  });

  const lecturerRole = await prisma.role.upsert({
    where: { name: "lecturer" },
    update: {},
    create: { name: "lecturer" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  // 2. Create Permissions
  const permissions = await prisma.permission.createMany({
    data: [
      // Course permissions
      { action: "view", resource: "course", scope: "own" },
      { action: "create", resource: "course", scope: "own" },
      { action: "edit", resource: "course", scope: "own" },
      { action: "view", resource: "course", scope: "global" },
      { action: "create", resource: "course", scope: "global" },
      { action: "edit", resource: "course", scope: "global" },
      { action: "publish", resource: "course", scope: "global" },

      // User management
      { action: "manage", resource: "user", scope: "global" },
    ],
    skipDuplicates: true, // avoids errors if you re-run seed
  });

  // 3. Fetch all permissions for role assignments
  const allPerms = await prisma.permission.findMany();

  const getPerm = (action: string, resource: string, scope: string) =>
    allPerms.find(p => p.action === action && p.resource === resource && p.scope === scope)!;

  // 4. Assign permissions to roles (RolePermission)
  // user: only view own courses
  await prisma.rolePermission.createMany({
    data: [{ roleId: memberRole.id, permissionId: getPerm("view", "course", "own").id }],
    skipDuplicates: true,
  });

  // lecturer: user perms + create/edit own courses
  await prisma.rolePermission.createMany({
    data: [
      { roleId: lecturerRole.id, permissionId: getPerm("view", "course", "own").id },
      { roleId: lecturerRole.id, permissionId: getPerm("create", "course", "own").id },
      { roleId: lecturerRole.id, permissionId: getPerm("edit", "course", "own").id },
    ],
    skipDuplicates: true,
  });

  // admin: global course perms + user management
  await prisma.rolePermission.createMany({
    data: [
      { roleId: adminRole.id, permissionId: getPerm("view", "course", "global").id },
      { roleId: adminRole.id, permissionId: getPerm("create", "course", "global").id },
      { roleId: adminRole.id, permissionId: getPerm("edit", "course", "global").id },
      { roleId: adminRole.id, permissionId: getPerm("publish", "course", "global").id },
      { roleId: adminRole.id, permissionId: getPerm("manage", "user", "global").id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Permission Seeded");
}

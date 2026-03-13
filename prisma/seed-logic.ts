import type { PrismaClient } from "@prisma/client";

// ============================================================================
// Seed data definitions
// ============================================================================

const ROLES = [
  {
    name: "super_admin",
    description: "Full platform access, can manage all resources and users",
  },
  {
    name: "admin",
    description: "Can manage users, invitations, view audit logs",
  },
  { name: "member", description: "Standard authenticated user" },
  { name: "viewer", description: "Read-only access" },
] as const;

const PERMISSIONS: ReadonlyArray<{
  resource: string;
  action: string;
  description: string;
}> = [
  { resource: "user", action: "read", description: "View user profiles" },
  { resource: "user", action: "create", description: "Create users" },
  {
    resource: "user",
    action: "update",
    description: "Edit user profiles, activate/deactivate",
  },
  { resource: "user", action: "delete", description: "Delete users" },
  {
    resource: "user",
    action: "admin",
    description: "Full user administration",
  },
  {
    resource: "role",
    action: "read",
    description: "View roles and permissions",
  },
  { resource: "role", action: "create", description: "Create custom roles" },
  {
    resource: "role",
    action: "update",
    description: "Modify role permissions",
  },
  { resource: "role", action: "delete", description: "Delete custom roles" },
  { resource: "invitation", action: "read", description: "View invitations" },
  {
    resource: "invitation",
    action: "create",
    description: "Create and send invitations",
  },
  {
    resource: "invitation",
    action: "revoke",
    description: "Revoke pending invitations",
  },
  { resource: "audit", action: "read", description: "View audit log" },
  {
    resource: "system",
    action: "admin",
    description: "System-level administration",
  },
  { resource: "facility", action: "read", description: "View facilities" },
  { resource: "facility", action: "create", description: "Create facilities" },
  { resource: "facility", action: "update", description: "Edit facilities" },
  { resource: "facility", action: "delete", description: "Delete facilities" },
  {
    resource: "facility",
    action: "manage",
    description: "Manage facility operations",
  },
  { resource: "production", action: "read", description: "View productions" },
  {
    resource: "production",
    action: "create",
    description: "Create productions",
  },
  {
    resource: "production",
    action: "update",
    description: "Edit productions",
  },
  {
    resource: "production",
    action: "delete",
    description: "Delete productions",
  },
  {
    resource: "production",
    action: "manage",
    description: "Manage production operations",
  },
  { resource: "guest", action: "read", description: "View guests" },
  { resource: "guest", action: "create", description: "Register guests" },
  { resource: "guest", action: "update", description: "Edit guest info" },
  { resource: "guest", action: "delete", description: "Remove guests" },
];

/** Role-permission mappings. super_admin gets ALL, others get specific subsets. */
const ROLE_PERMISSIONS: Record<string, ReadonlyArray<string>> = {
  // super_admin: "ALL" — handled specially below
  admin: [
    "user:read",
    "user:create",
    "user:update",
    "user:delete",
    "user:admin",
    "role:read",
    "invitation:read",
    "invitation:create",
    "invitation:revoke",
    "audit:read",
  ],
  member: ["user:read"],
  viewer: ["user:read"],
};

// ============================================================================
// Seed function (importable for testing)
// ============================================================================

interface SeedOptions {
  /** Pass explicitly to override process.env.NODE_ENV. Pass null to simulate unset. */
  nodeEnv?: string | null;
  adminEmail?: string;
}

/**
 * Seeds the database with default RBAC roles, permissions, and mappings.
 * All operations use upserts for idempotency.
 */
export async function seedDatabase(
  prisma: PrismaClient,
  options: SeedOptions = {},
): Promise<void> {
  const nodeEnv =
    "nodeEnv" in options ? options.nodeEnv : process.env.NODE_ENV;
  const adminEmail =
    options.adminEmail ??
    process.env.SEED_ADMIN_EMAIL ??
    "admin@production.city";

  // 1. Upsert roles
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, isSystem: true },
      create: { name: role.name, description: role.description, isSystem: true },
    });
  }

  // 2. Upsert permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        resource_action: { resource: perm.resource, action: perm.action },
      },
      update: { description: perm.description },
      create: {
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  // 3. Upsert role-permission mappings
  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(
    allPermissions.map((p) => [`${p.resource}:${p.action}`, p.id]),
  );

  // super_admin gets ALL permissions
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "super_admin" },
  });
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // Other roles get specific permission subsets
  for (const [roleName, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });
    for (const key of permKeys) {
      const permId = permMap.get(key);
      if (!permId) {
        console.warn(`Warning: permission ${key} not found, skipping`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permId },
        },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
  }

  // 4. EOI seed data — only in development or test environments
  const eoiAllowedEnvs = ["development", "test"];
  if (nodeEnv && eoiAllowedEnvs.includes(nodeEnv)) {
    const eoiSeeds = [
      {
        email: "producer@example.com",
        category: "producer",
        name: "Sarah Chen",
        locale: "en",
        status: "new" as const,
        sourcePage: "/facilities",
        metadata: JSON.stringify({ company: "Chen Studios", productionType: "film", timeline: "6months" }),
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
        marketingOptIn: true,
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "facilities-launch",
      },
      {
        email: "creative@example.com",
        category: "creative",
        name: "Aiko Tanaka",
        locale: "ja",
        status: "new" as const,
        sourcePage: "/creative-services",
        metadata: JSON.stringify({ discipline: "visual-effects", portfolioUrl: "https://example.com/portfolio" }),
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
      },
      {
        email: "partner@example.com",
        category: "partner",
        name: "María García",
        locale: "es",
        status: "contacted" as const,
        sourcePage: "/partnerships",
        metadata: JSON.stringify({ partnershipArea: "technology", organisation: "TechCo" }),
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
        marketingOptIn: true,
      },
      {
        email: "general@example.com",
        category: "general",
        name: "Ahmed Al-Rashid",
        locale: "ar",
        status: "new" as const,
        sourcePage: "/",
        message: "I would like to learn more about Production City.",
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
      },
      {
        email: "education@example.com",
        category: "education",
        name: "Li Wei",
        locale: "zh",
        status: "archived" as const,
        sourcePage: "/education",
        metadata: JSON.stringify({ institution: "Beijing Film Academy", programArea: "cinematography" }),
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
        archivedAt: new Date(),
        archivedBy: "system",
        utmSource: "linkedin",
        utmMedium: "social",
      },
    ];

    for (const seed of eoiSeeds) {
      const existing = await prisma.expressionOfInterest.findFirst({
        where: { email: seed.email, category: seed.category },
      });
      if (!existing) {
        await prisma.expressionOfInterest.create({ data: seed });
      }
    }
    console.log("[SEED] EOI seed data created/verified");
  }

  // 5. Dev admin user — only in development or test environments
  const allowedEnvs = eoiAllowedEnvs;
  if (nodeEnv && allowedEnvs.includes(nodeEnv)) {
    console.warn(
      `[SEED] Creating dev admin user (${adminEmail}) — NODE_ENV=${nodeEnv}`,
    );

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { status: "active", emailVerified: true },
      create: {
        email: adminEmail,
        name: "Dev Admin",
        status: "active",
        emailVerified: true,
      },
    });

    // Assign super_admin role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: superAdminRole.id },
      },
      update: {},
      create: { userId: user.id, roleId: superAdminRole.id },
    });
  } else {
    console.log(
      `[SEED] Skipping dev admin creation — NODE_ENV=${String(nodeEnv ?? "undefined")} (only allowed in: ${allowedEnvs.join(", ")})`,
    );
  }
}

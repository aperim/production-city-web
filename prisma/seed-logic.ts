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
  // Dashboard permissions (for dashboard role detection)
  { resource: "dashboard", action: "admin", description: "Dashboard admin role" },
  { resource: "dashboard", action: "executive", description: "Dashboard executive role" },
  { resource: "dashboard", action: "staff", description: "Dashboard staff role" },
  { resource: "dashboard", action: "client", description: "Dashboard client role" },
  { resource: "dashboard", action: "vendor", description: "Dashboard vendor role" },
  { resource: "dashboard", action: "investor", description: "Dashboard investor role" },
  { resource: "dashboard", action: "guest", description: "Dashboard guest role" },
  { resource: "dashboard", action: "government", description: "Dashboard government role" },
  { resource: "dashboard", action: "partner", description: "Dashboard partner role" },
  { resource: "dashboard", action: "first_nations", description: "Dashboard First Nations role" },
  // Dashboard-specific permissions
  { resource: "hr", action: "read", description: "Read HR data" },
  { resource: "legal", action: "read", description: "Read legal data" },
  { resource: "company_finance", action: "read", description: "Read company finance" },
  { resource: "productions", action: "read", description: "Read productions" },
  { resource: "facilities", action: "read", description: "Read facilities" },
  { resource: "facilities", action: "book", description: "Book facilities" },
  { resource: "analytics", action: "read", description: "Read analytics" },
  { resource: "investor", action: "read", description: "Read investor data" },
  { resource: "events", action: "browse", description: "Browse events" },
  { resource: "education", action: "browse", description: "Browse education" },
  { resource: "education", action: "collaborate", description: "Collaborate on education" },
  { resource: "workflow", action: "read", description: "Read workflow" },
  { resource: "workflow", action: "review", description: "Review workflows" },
  { resource: "vendors", action: "read", description: "Read vendor data" },
  { resource: "data_rooms", action: "investor", description: "Investor data room access" },
  { resource: "data_rooms", action: "government", description: "Government data room access" },
  { resource: "data_rooms", action: "partner", description: "Partner data room access" },
  { resource: "gov_policy", action: "read", description: "Read government policy" },
  { resource: "analytics", action: "economic_impact", description: "View economic impact analytics" },
  { resource: "partnerships", action: "read", description: "Read partnerships" },
  { resource: "first_nations", action: "read", description: "Read First Nations data" },
  { resource: "community", action: "read", description: "Read community data" },
  { resource: "talent", action: "read", description: "Read talent data" },
  // Announcements permissions
  { resource: "announcement", action: "read", description: "Public read access to announcements" },
  { resource: "announcement", action: "read_admin", description: "Admin dashboard access to announcements" },
  { resource: "announcement", action: "create", description: "Create announcements" },
  { resource: "announcement", action: "update", description: "Update announcements" },
  { resource: "announcement", action: "delete", description: "Delete announcements" },
  { resource: "announcement", action: "publish", description: "Publish announcements" },
  // Categories permissions
  { resource: "category", action: "read", description: "View announcement categories" },
  { resource: "category", action: "create", description: "Create announcement categories" },
  { resource: "category", action: "update", description: "Update announcement categories" },
  { resource: "category", action: "delete", description: "Delete announcement categories" },
  // Tags permissions
  { resource: "tag", action: "read", description: "View announcement tags" },
  { resource: "tag", action: "create", description: "Create announcement tags" },
  { resource: "tag", action: "update", description: "Update announcement tags" },
  { resource: "tag", action: "delete", description: "Delete announcement tags" },
  // Subscription permissions
  { resource: "subscription", action: "read", description: "View subscriptions" },
  { resource: "subscription", action: "manage", description: "Manage subscriptions" },
  { resource: "subscription", action: "read_pii", description: "View subscriber phone numbers (PII)" },
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
    "announcement:read",
    "announcement:read_admin",
    "announcement:create",
    "announcement:update",
    "announcement:delete",
    "announcement:publish",
    "category:read",
    "category:create",
    "category:update",
    "category:delete",
    "tag:read",
    "tag:create",
    "tag:update",
    "tag:delete",
    "subscription:read",
    "subscription:manage",
  ],
  member: [
    "user:read",
    "announcement:read",
    "category:read",
    "tag:read",
  ],
  viewer: [
    "user:read",
    "announcement:read",
    "category:read",
    "tag:read",
  ],
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
  const adminEmailRaw =
    options.adminEmail ?? process.env.SEED_ADMIN_EMAIL;
  const isDevOrTestEnv =
    nodeEnv != null && ["development", "test"].includes(nodeEnv);
  const adminEmail = adminEmailRaw ?? (isDevOrTestEnv ? "troy@team.production.city" : undefined);

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

  // 4. Upsert announcement categories (all environments)
  const CATEGORIES = [
    { name: "General Updates", slug: "general-updates", description: "General platform news and updates", sortOrder: 0 },
    { name: "Development", slug: "development", description: "Development progress and technical updates", sortOrder: 1 },
    { name: "Events", slug: "events", description: "Upcoming events and activities", sortOrder: 2 },
    { name: "Community", slug: "community", description: "Community news and highlights", sortOrder: 3 },
  ];

  for (const cat of CATEGORIES) {
    await prisma.announcementCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log("[SEED] Announcement categories created/verified");

  // 5. EOI seed data — only in development or test environments
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
        sourcePage: "/creative",
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
        sourcePage: "/contact",
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
        sourcePage: "/community",
        metadata: JSON.stringify({ institution: "Beijing Film Academy", programArea: "cinematography" }),
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
        archivedAt: new Date(),
        archivedBy: "system",
        utmSource: "linkedin",
        utmMedium: "social",
      },
      {
        email: "employee@example.com",
        category: "employment",
        name: "Jordan Lee",
        locale: "en",
        status: "new" as const,
        sourcePage: "/contact",
        metadata: JSON.stringify({ desiredRole: "Sound Engineer", experienceLevel: "5-10years", availability: "immediate" }),
        consentVersion: "2026-03-01",
        privacyAcceptedAt: new Date(),
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

  // 5a. Twilio sender routes (dev/test only)
  if (nodeEnv && eoiAllowedEnvs.includes(nodeEnv)) {
    const TWILIO_ROUTES = [
      { phoneNumber: "+12125550001", prefixes: JSON.stringify(["+1"]), isDefault: 1 },
      { phoneNumber: "+61400000000", prefixes: JSON.stringify(["+61", "+62"]), isDefault: 0 },
      { phoneNumber: "+8613800000000", prefixes: JSON.stringify(["+86"]), isDefault: 0 },
    ];

    for (const route of TWILIO_ROUTES) {
      await prisma.twilioSenderRoute.upsert({
        where: { phoneNumber: route.phoneNumber },
        update: { prefixes: route.prefixes, isDefault: route.isDefault },
        create: route,
      });
    }
    console.log("[SEED] Twilio sender routes created/verified");
  }

  // 6. Bootstrap platform admin
  // Solves chicken-and-egg: magic link login requires a user record to exist
  // before it sends an email (anti-enumeration). Without a bootstrap admin,
  // no one can log in to a fresh deployment.
  //
  // In dev/test: defaults to troy@team.production.city.
  // In production: SEED_ADMIN_EMAIL must be set explicitly.
  // Safety: in non-dev environments, only bootstraps when no users exist yet.
  if (!adminEmail) {
    console.warn(
      `[SEED] Skipping admin bootstrap — SEED_ADMIN_EMAIL not set (NODE_ENV=${String(nodeEnv ?? "undefined")}). ` +
      "Set SEED_ADMIN_EMAIL to bootstrap a super_admin user.",
    );
  } else {
    const existingUserCount = isDevOrTestEnv ? 0 : await prisma.user.count();
    if (!isDevOrTestEnv && existingUserCount > 0) {
      console.log(
        `[SEED] Skipping admin bootstrap — ${existingUserCount} users already exist (NODE_ENV=${String(nodeEnv ?? "undefined")})`,
      );
    } else {
      const adminName = isDevOrTestEnv ? "Dev Admin" : "Platform Admin";
      console.log(
        `[SEED] Bootstrapping admin user (${adminEmail}) as ${adminName} — NODE_ENV=${String(nodeEnv ?? "undefined")}`,
      );

      const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { status: "active", emailVerified: true },
        create: {
          email: adminEmail,
          name: adminName,
          status: "active",
          emailVerified: true,
        },
      });

      await prisma.userRole.upsert({
        where: {
          userId_roleId: { userId: user.id, roleId: superAdminRole.id },
        },
        update: {},
        create: { userId: user.id, roleId: superAdminRole.id },
      });

      const defaultChannels = [
        "admin:notifications",
        "admin:eoi",
        "admin:approvals",
        "admin:audit",
      ];
      for (const channel of defaultChannels) {
        await prisma.notificationPreference.upsert({
          where: { userId_channel: { userId: user.id, channel } },
          update: {},
          create: { userId: user.id, channel, enabled: true },
        });
      }
      console.log("[SEED] Admin user and notification preferences created/verified");
    }
  }

  // 7-8. Dev/test only data
  const allowedEnvs = eoiAllowedEnvs;
  if (nodeEnv && allowedEnvs.includes(nodeEnv)) {
    // 7. Dashboard test users — one per dashboard role (dev/test only)
    const DASHBOARD_TEST_USERS: Array<{
      email: string;
      name: string;
      dashboardRole: string;
      /** Permissions granted via the user's seeded role. */
      permissions: [string, string][];
    }> = [
      {
        email: "admin@dashboard.test",
        name: "Dashboard Admin",
        dashboardRole: "admin",
        permissions: [["dashboard", "admin"]],
      },
      {
        email: "executive@dashboard.test",
        name: "Dashboard Executive",
        dashboardRole: "executive",
        permissions: [
          ["dashboard", "executive"],
          ["hr", "read"],
          ["legal", "read"],
          ["company_finance", "read"],
          ["productions", "read"],
          ["facilities", "read"],
          ["analytics", "read"],
          ["investor", "read"],
        ],
      },
      {
        email: "staff@dashboard.test",
        name: "Dashboard Staff",
        dashboardRole: "staff",
        permissions: [
          ["dashboard", "staff"],
          ["hr", "read"],
          ["productions", "read"],
          ["facilities", "book"],
          ["workflow", "read"],
          ["talent", "read"],
        ],
      },
      {
        email: "client@dashboard.test",
        name: "Dashboard Client",
        dashboardRole: "client",
        permissions: [
          ["dashboard", "client"],
          ["productions", "read"],
          ["facilities", "book"],
          ["workflow", "review"],
        ],
      },
      {
        email: "vendor@dashboard.test",
        name: "Dashboard Vendor",
        dashboardRole: "vendor",
        permissions: [
          ["dashboard", "vendor"],
          ["vendors", "read"],
        ],
      },
      {
        email: "investor@dashboard.test",
        name: "Dashboard Investor",
        dashboardRole: "investor",
        permissions: [
          ["dashboard", "investor"],
          ["investor", "read"],
          ["data_rooms", "investor"],
        ],
      },
      {
        email: "guest@dashboard.test",
        name: "Dashboard Guest",
        dashboardRole: "guest",
        permissions: [
          ["dashboard", "guest"],
          ["events", "browse"],
          ["education", "browse"],
        ],
      },
      {
        email: "government@dashboard.test",
        name: "Dashboard Government",
        dashboardRole: "government",
        permissions: [
          ["dashboard", "government"],
          ["gov_policy", "read"],
          ["data_rooms", "government"],
          ["analytics", "economic_impact"],
        ],
      },
      {
        email: "partner@dashboard.test",
        name: "Dashboard Partner",
        dashboardRole: "partner",
        permissions: [
          ["dashboard", "partner"],
          ["partnerships", "read"],
          ["data_rooms", "partner"],
          ["education", "collaborate"],
        ],
      },
      {
        email: "first_nations@dashboard.test",
        name: "Dashboard First Nations",
        dashboardRole: "first_nations",
        permissions: [
          ["dashboard", "first_nations"],
          ["first_nations", "read"],
          ["community", "read"],
        ],
      },
    ];

    for (const testUser of DASHBOARD_TEST_USERS) {
      // Upsert the user
      const dashUser = await prisma.user.upsert({
        where: { email: testUser.email },
        update: { status: "active", emailVerified: true },
        create: {
          email: testUser.email,
          name: testUser.name,
          status: "active",
          emailVerified: true,
        },
      });

      // Create a dedicated role for this dashboard user
      const roleName = `dashboard_${testUser.dashboardRole}`;
      const dashRole = await prisma.role.upsert({
        where: { name: roleName },
        update: { description: `Dashboard ${testUser.dashboardRole} role`, isSystem: true },
        create: {
          name: roleName,
          description: `Dashboard ${testUser.dashboardRole} role`,
          isSystem: true,
        },
      });

      // Grant permissions to the role
      for (const [resource, action] of testUser.permissions) {
        const permId = permMap.get(`${resource}:${action}`);
        if (!permId) {
          console.warn(`Warning: permission ${resource}:${action} not found for dashboard role ${testUser.dashboardRole}, skipping`);
          continue;
        }
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: dashRole.id, permissionId: permId },
          },
          update: {},
          create: { roleId: dashRole.id, permissionId: permId },
        });
      }

      // Assign role to user
      await prisma.userRole.upsert({
        where: {
          userId_roleId: { userId: dashUser.id, roleId: dashRole.id },
        },
        update: {},
        create: { userId: dashUser.id, roleId: dashRole.id },
      });
    }
    console.log("[SEED] Dashboard test users created/verified (10 roles)");

    // 8. Sample feature notifications (dev/test only)
    const SAMPLE_NOTIFICATIONS: Array<{
      userEmail: string;
      featureId: string;
    }> = [
      { userEmail: "admin@dashboard.test", featureId: "administration.users.user_management" },
      { userEmail: "executive@dashboard.test", featureId: "home.overview.executive" },
      { userEmail: "guest@dashboard.test", featureId: "home.overview.guest" },
      { userEmail: "staff@dashboard.test", featureId: "home.overview.staff" },
    ];

    for (const notif of SAMPLE_NOTIFICATIONS) {
      const notifUser = await prisma.user.findUnique({ where: { email: notif.userEmail } });
      if (!notifUser) continue;

      const existing = await prisma.featureNotification.findUnique({
        where: {
          userId_featureId: { userId: notifUser.id, featureId: notif.featureId },
        },
      });
      if (!existing) {
        await prisma.featureNotification.create({
          data: { userId: notifUser.id, featureId: notif.featureId },
        });
      }
    }
    console.log("[SEED] Sample feature notifications created/verified");
  }
}

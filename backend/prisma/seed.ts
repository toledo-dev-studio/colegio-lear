import bcrypt from "bcrypt";
import { prisma } from "../src/shared/lib/prisma";
import { env } from "../src/shared/config/env.config";

/**
 * Module references to seed. These represent the application modules
 * that can have privileges assigned to profiles.
 */
const MODULE_REFERENCES = [
  { name: "employees", description: "Employee management module" },
  { name: "profiles", description: "Profile and privilege management module" },
  { name: "audit", description: "Audit log module" },
  {
    name: "education-levels",
    description: "Education level management module",
  },
  { name: "grades", description: "Grade management module" },
  { name: "groups", description: "Group management module" },
  { name: "subjects", description: "Subject management module" },
];

/** All CRUD actions available for privilege assignment */
const ACTIONS = ["create", "read", "update", "delete"] as const;

/**
 * Seeds the database with initial data:
 * 1. Module references (employees, profiles, audit)
 * 2. Super Admin employee (from env vars)
 * 3. Super Admin profile with full privileges on all modules
 * 4. Assigns the Super Admin profile to the Super Admin employee
 *
 * This script is idempotent — it skips creation if the Super Admin already exists.
 */
async function main(): Promise<void> {
  console.log("🌱 Starting database seed...");

  // 1. Seed module references (upsert for idempotency)
  console.log("📦 Seeding module references...");
  const moduleRefs = await Promise.all(
    MODULE_REFERENCES.map((mod) =>
      prisma.moduleReference.upsert({
        where: { name: mod.name },
        update: { description: mod.description },
        create: { name: mod.name, description: mod.description },
      }),
    ),
  );
  console.log(
    `✅ Module references seeded: ${moduleRefs.map((m: { name: string }) => m.name).join(", ")}`,
  );

  // 2. Check if Super Admin already exists
  const superAdminEmail = env.SUPER_ADMIN_EMAIL.toLowerCase();
  const existingAdmin = await prisma.employee.findUnique({
    where: { email: superAdminEmail },
  });

  if (existingAdmin) {
    console.log(
      `⏭️  Super Admin (${superAdminEmail}) already exists — skipping creation.`,
    );
    return;
  }

  // 3. Create Super Admin employee
  console.log("👤 Creating Super Admin employee...");
  const passwordHash = await bcrypt.hash(
    env.SUPER_ADMIN_PASSWORD,
    env.BCRYPT_SALT_ROUNDS,
  );

  const superAdmin = await prisma.employee.create({
    data: {
      firstName: env.SUPER_ADMIN_FIRST_NAME,
      lastName: env.SUPER_ADMIN_LAST_NAME,
      email: superAdminEmail,
      passwordHash,
      employeeType: "administrative",
      isActive: true,
    },
  });
  console.log(`✅ Super Admin employee created (ID: ${superAdmin.id})`);

  // 4. Create Super Admin profile
  console.log("🛡️  Creating Super Admin profile...");
  const superAdminProfile = await prisma.profile.create({
    data: {
      name: "Super Admin",
      description: "Full access profile with all privileges on every module",
    },
  });
  console.log(`✅ Super Admin profile created (ID: ${superAdminProfile.id})`);

  // 5. Create full privileges (all actions on all module references)
  console.log("🔑 Assigning full privileges to Super Admin profile...");
  const privilegeData = moduleRefs.flatMap((mod: { id: number }) =>
    ACTIONS.map((action) => ({
      profileId: superAdminProfile.id,
      moduleReferenceId: mod.id,
      action,
    })),
  );

  await prisma.privilege.createMany({ data: privilegeData });
  console.log(`✅ ${privilegeData.length} privileges assigned`);

  // 6. Assign profile to Super Admin employee
  console.log("🔗 Assigning Super Admin profile to Super Admin employee...");
  await prisma.employee.update({
    where: { id: superAdmin.id },
    data: { profileId: superAdminProfile.id },
  });
  console.log("✅ Super Admin profile assigned to employee");

  console.log("🌱 Database seed completed successfully!");
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

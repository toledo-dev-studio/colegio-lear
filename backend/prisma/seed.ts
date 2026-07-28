import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { BloodType, DayOfWeek } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool, { schema: "core" });
const prisma = new PrismaClient({ adapter });

// ─── Fixed UUIDs (valid UUID v4 format) ─────────────────────────────────────────

const ACADEMIC_LEVELS = {
  preescolar: "a1000000-0001-4000-8000-000000000001",
  primaria: "a1000000-0001-4000-8000-000000000002",
  secundaria: "a1000000-0001-4000-8000-000000000003",
};

const EDUCATION_LEVELS = {
  primero_preescolar: "b2000000-0002-4000-8000-000000000001",
  segundo_preescolar: "b2000000-0002-4000-8000-000000000002",
  primero_primaria: "b2000000-0002-4000-8000-000000000003",
  segundo_primaria: "b2000000-0002-4000-8000-000000000004",
  primero_secundaria: "b2000000-0002-4000-8000-000000000005",
  segundo_secundaria: "b2000000-0002-4000-8000-000000000006",
};

const SCHOOL_SUBJECTS = {
  matematicas_1p: "c3000000-0003-4000-8000-000000000001",
  espanol_1p: "c3000000-0003-4000-8000-000000000002",
  ciencias_1p: "c3000000-0003-4000-8000-000000000003",
  matematicas_2p: "c3000000-0003-4000-8000-000000000004",
  matematicas_1s: "c3000000-0003-4000-8000-000000000005",
  historia_1s: "c3000000-0003-4000-8000-000000000006",
  // 2026 dataset additions
  historia_1p: "c3000000-0003-4000-8000-000000000007",
  ingles_1p: "c3000000-0003-4000-8000-000000000008",
  espanol_1pe: "c3000000-0003-4000-8000-000000000009",
  matematicas_1pe: "c3000000-0003-4000-8000-000000000010",
  ingles_1pe: "c3000000-0003-4000-8000-000000000011",
  expresion_1pe: "c3000000-0003-4000-8000-000000000012",
};

const SCHOLARSHIPS = {
  excelencia_academica: "d4000000-0004-4000-8000-000000000001",
  deportiva: "d4000000-0004-4000-8000-000000000002",
  hermanos: "d4000000-0004-4000-8000-000000000003",
  necesidad_economica: "d4000000-0004-4000-8000-000000000004",
};

const PAYMENT_CONCEPTS = {
  inscripcion: "e5000000-0005-4000-8000-000000000001",
  colegiatura_mensual: "e5000000-0005-4000-8000-000000000002",
  material_didactico: "e5000000-0005-4000-8000-000000000003",
  uniforme_escolar: "e5000000-0005-4000-8000-000000000004",
  seguro_escolar: "e5000000-0005-4000-8000-000000000005",
};

const JOB_TITLES = {
  director_general: "f6000000-0006-4000-8000-000000000001",
  coordinador: "f6000000-0006-4000-8000-000000000002",
  docente: "f6000000-0006-4000-8000-000000000003",
  auxiliar_administrativo: "f6000000-0006-4000-8000-000000000004",
};

const SECURITY_ROLES = {
  superadmin: "aa000000-0007-4000-8000-000000000001",
  admin: "aa000000-0007-4000-8000-000000000002",
  coordinador_academico: "aa000000-0007-4000-8000-000000000003",
  auxiliar_administrativo: "aa000000-0007-4000-8000-000000000004",
  docente: "aa000000-0007-4000-8000-000000000005",
};

// ─── Fixed UUIDs — 2026 realistic dataset (academic cycles, groups, wallet) ─────

const ACADEMIC_CYCLES_2026 = {
  primaria: "bb000000-0008-4000-8000-000000000001",
  preescolar: "bb000000-0008-4000-8000-000000000002",
};

const ACADEMIC_CYCLE_GROUPS_2026 = {
  primaria_a: "cc000000-0009-4000-8000-000000000001",
  primaria_b: "cc000000-0009-4000-8000-000000000002",
  preescolar_a: "cc000000-0009-4000-8000-000000000003",
  preescolar_b: "cc000000-0009-4000-8000-000000000004",
};

const WALLET_CATALOG_2026 = {
  primaria_inscripcion: "dd000000-0010-4000-8000-000000000001",
  primaria_mantenimiento: "dd000000-0010-4000-8000-000000000002",
  primaria_material: "dd000000-0010-4000-8000-000000000003",
  preescolar_inscripcion: "dd000000-0010-4000-8000-000000000004",
  preescolar_mantenimiento: "dd000000-0010-4000-8000-000000000005",
  preescolar_material: "dd000000-0010-4000-8000-000000000006",
};

const ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026 = {
  primaria_espanol_1p: "ac000000-0013-4000-8000-000000000001",
  primaria_matematicas_1p: "ac000000-0013-4000-8000-000000000002",
  primaria_ciencias_1p: "ac000000-0013-4000-8000-000000000003",
  primaria_ingles_1p: "ac000000-0013-4000-8000-000000000004",
  primaria_historia_1p: "ac000000-0013-4000-8000-000000000005",
  preescolar_espanol_1pe: "ac000000-0013-4000-8000-000000000006",
  preescolar_matematicas_1pe: "ac000000-0013-4000-8000-000000000007",
  preescolar_ingles_1pe: "ac000000-0013-4000-8000-000000000008",
  preescolar_expresion_1pe: "ac000000-0013-4000-8000-000000000009",
};

const ANNOUNCEMENTS_2026 = {
  inicio_cursos: "ff000000-0012-4000-8000-000000000001",
  dia_madres: "ff000000-0012-4000-8000-000000000002",
  vacaciones_verano: "ff000000-0012-4000-8000-000000000003",
};

// ─── All module keys in the system ──────────────────────────────────────────────

const ALL_MODULE_KEYS = [
  "dashboard",
  "my-account",
  "my-classes",
  "students",
  "academic-cycles",
  "announcements",
  "academic-levels",
  "school-subjects",
  "scholarships",
  "payment-concepts",
  "employees",
  "job-titles",
  "security-roles",
  "settings",
];

// ─── Seed function ──────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // --- Security Roles ---
  // SuperAdmin: full access to everything
  const superAdminRole = await prisma.securityRole.upsert({
    where: { id: SECURITY_ROLES.superadmin },
    update: {},
    create: {
      id: SECURITY_ROLES.superadmin,
      name: "SuperAdmin",
      description:
        "Rol con acceso total al sistema, incluyendo gestión de roles de seguridad",
      isActive: true,
    },
  });

  await prisma.securityRolePermission.deleteMany({
    where: { securityRoleId: superAdminRole.id },
  });
  await prisma.securityRolePermission.createMany({
    data: ALL_MODULE_KEYS.map((moduleKey) => ({
      securityRoleId: superAdminRole.id,
      moduleKey,
      canRead: true,
      canWrite: true,
      canDelete: true,
    })),
  });

  // Admin: full access except security-roles
  const adminRole = await prisma.securityRole.upsert({
    where: { id: SECURITY_ROLES.admin },
    update: {},
    create: {
      id: SECURITY_ROLES.admin,
      name: "Administrador",
      description:
        "Rol administrativo con acceso completo excepto roles de seguridad",
      isActive: true,
    },
  });

  await prisma.securityRolePermission.deleteMany({
    where: { securityRoleId: adminRole.id },
  });
  await prisma.securityRolePermission.createMany({
    data: ALL_MODULE_KEYS.map((moduleKey) => ({
      securityRoleId: adminRole.id,
      moduleKey,
      canRead: true,
      canWrite: moduleKey !== "security-roles",
      canDelete: moduleKey !== "security-roles",
    })),
  });

  // Helper: build a full ALL_MODULE_KEYS permission array from a per-module resolver
  function permissionsFrom(
    resolver: (moduleKey: string) => {
      canRead: boolean;
      canWrite: boolean;
      canDelete: boolean;
    },
  ) {
    return ALL_MODULE_KEYS.map((moduleKey) => ({
      moduleKey,
      ...resolver(moduleKey),
    }));
  }

  // Coordinador Académico: operational read/write across academic modules,
  // no access to employees/job-titles/security-roles/settings, no deletes at all.
  const coordinadorWriteModules = new Set([
    "my-account",
    "students",
    "academic-cycles",
    "announcements",
    "academic-levels",
    "school-subjects",
    "scholarships",
    "payment-concepts",
  ]);
  const coordinadorRole = await prisma.securityRole.upsert({
    where: { id: SECURITY_ROLES.coordinador_academico },
    update: {},
    create: {
      id: SECURITY_ROLES.coordinador_academico,
      name: "Coordinador Académico",
      description:
        "Acceso operativo a módulos académicos; sin gestión de empleados, roles o configuración",
      isActive: true,
    },
  });
  await prisma.securityRolePermission.deleteMany({
    where: { securityRoleId: coordinadorRole.id },
  });
  await prisma.securityRolePermission.createMany({
    data: permissionsFrom((moduleKey) => ({
      canRead: !["employees", "job-titles", "security-roles", "settings"].includes(
        moduleKey,
      ),
      canWrite: coordinadorWriteModules.has(moduleKey),
      canDelete: false,
    })).map((p) => ({ ...p, securityRoleId: coordinadorRole.id })),
  });

  // Auxiliar Administrativo: narrow front-desk access — read a handful of
  // modules, write only students/announcements/my-account, no deletes.
  const auxiliarReadModules = new Set([
    "dashboard",
    "my-account",
    "students",
    "academic-cycles",
    "announcements",
    "payment-concepts",
    "scholarships",
  ]);
  const auxiliarWriteModules = new Set(["my-account", "students", "announcements"]);
  const auxiliarRole = await prisma.securityRole.upsert({
    where: { id: SECURITY_ROLES.auxiliar_administrativo },
    update: {},
    create: {
      id: SECURITY_ROLES.auxiliar_administrativo,
      name: "Auxiliar Administrativo",
      description:
        "Acceso limitado de mostrador: consulta general y captura de alumnos/anuncios",
      isActive: true,
    },
  });
  await prisma.securityRolePermission.deleteMany({
    where: { securityRoleId: auxiliarRole.id },
  });
  await prisma.securityRolePermission.createMany({
    data: permissionsFrom((moduleKey) => ({
      canRead: auxiliarReadModules.has(moduleKey),
      canWrite: auxiliarWriteModules.has(moduleKey),
      canDelete: false,
    })).map((p) => ({ ...p, securityRoleId: auxiliarRole.id })),
  });

  // Docente: read-only teaching context, can only write their own account.
  const docenteReadModules = new Set([
    "dashboard",
    "my-account",
    "my-classes",
    "academic-cycles",
    "announcements",
  ]);
  const docenteRole = await prisma.securityRole.upsert({
    where: { id: SECURITY_ROLES.docente },
    update: {},
    create: {
      id: SECURITY_ROLES.docente,
      name: "Docente",
      description: "Acceso de solo lectura a su contexto de clases; edita solo su cuenta",
      isActive: true,
    },
  });
  await prisma.securityRolePermission.deleteMany({
    where: { securityRoleId: docenteRole.id },
  });
  await prisma.securityRolePermission.createMany({
    data: permissionsFrom((moduleKey) => ({
      canRead: docenteReadModules.has(moduleKey),
      canWrite: moduleKey === "my-account",
      canDelete: false,
    })).map((p) => ({ ...p, securityRoleId: docenteRole.id })),
  });

  console.log(
    `  ✓ Security roles: ${superAdminRole.name}, ${adminRole.name}, ${coordinadorRole.name}, ${auxiliarRole.name}, ${docenteRole.name}`,
  );

  // --- Job Titles ---
  const directorGeneral = await prisma.jobTitle.upsert({
    where: { id: JOB_TITLES.director_general },
    update: {},
    create: {
      id: JOB_TITLES.director_general,
      name: "Director General",
      description: "Dirección general del colegio",
      jobTitleType: "administrative_staff",
      isActive: true,
    },
  });

  await prisma.jobTitle.upsert({
    where: { id: JOB_TITLES.coordinador },
    update: {},
    create: {
      id: JOB_TITLES.coordinador,
      name: "Coordinador Académico",
      description: "Coordinación de actividades académicas",
      jobTitleType: "administrative_staff",
      isActive: true,
    },
  });

  await prisma.jobTitle.upsert({
    where: { id: JOB_TITLES.docente },
    update: {},
    create: {
      id: JOB_TITLES.docente,
      name: "Docente",
      description: "Profesor de aula",
      jobTitleType: "teacher",
      isActive: true,
    },
  });

  await prisma.jobTitle.upsert({
    where: { id: JOB_TITLES.auxiliar_administrativo },
    update: {},
    create: {
      id: JOB_TITLES.auxiliar_administrativo,
      name: "Auxiliar Administrativo",
      description: "Apoyo administrativo y de mostrador",
      jobTitleType: "administrative_staff",
      isActive: true,
    },
  });

  console.log(
    "  ✓ Job titles: Director General, Coordinador Académico, Docente, Auxiliar Administrativo",
  );

  // --- Admin Employees ---
  const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

  // SuperAdmin (from env vars)
  const admin1Name = process.env.ADMIN1_NAME || "Super";
  const admin1LastName = process.env.ADMIN1_LAST_NAME || "Admin";
  const admin1Email = process.env.ADMIN1_EMAIL || "superadmin@colegiolear.com";
  const admin1Password = process.env.ADMIN1_PASSWORD || "SuperAdmin123!";
  const admin1Username =
    admin1Name.charAt(0).toLowerCase() +
    admin1LastName.toLowerCase().replace(/\s/g, "");
  const admin1HashedPassword = await bcrypt.hash(admin1Password, BCRYPT_ROUNDS);

  await prisma.employee.upsert({
    where: { email: admin1Email },
    update: { password: admin1HashedPassword },
    create: {
      name: admin1Name,
      firstLastName: admin1LastName,
      phoneNumber: "0000000000",
      email: admin1Email,
      username: admin1Username,
      password: admin1HashedPassword,
      mustChangePassword: false,
      isActive: true,
      securityRoleId: superAdminRole.id,
      jobTitleId: directorGeneral.id,
    },
  });

  // Admin 2 (from env vars)
  const admin2Name = process.env.ADMIN2_NAME || "Admin";
  const admin2LastName = process.env.ADMIN2_LAST_NAME || "Two";
  const admin2Email = process.env.ADMIN2_EMAIL || "admin2@colegiolear.com";
  const admin2Password = process.env.ADMIN2_PASSWORD || "Admin456!";
  const admin2Username =
    admin2Name.charAt(0).toLowerCase() +
    admin2LastName.toLowerCase().replace(/\s/g, "");
  const admin2HashedPassword = await bcrypt.hash(admin2Password, BCRYPT_ROUNDS);

  await prisma.employee.upsert({
    where: { email: admin2Email },
    update: { password: admin2HashedPassword },
    create: {
      name: admin2Name,
      firstLastName: admin2LastName,
      phoneNumber: "0000000000",
      email: admin2Email,
      username: admin2Username,
      password: admin2HashedPassword,
      mustChangePassword: false,
      isActive: true,
      securityRoleId: adminRole.id,
      jobTitleId: directorGeneral.id,
    },
  });

  console.log(
    `  ✓ Admin employees: ${admin1Username} (SuperAdmin), ${admin2Username} (Admin)`,
  );

  // --- Realistic 2026 dataset helpers ─────────────────────────────────────────

  const STAFF_EMAIL_DOMAIN = "colegiolear.com.mx";

  /** Strips accents so generated emails/usernames stay plain ASCII. */
  function stripAccents(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ñ/gi, (m) => (m === "ñ" ? "n" : "N"));
  }

  function buildUsername(
    name: string,
    firstLastName: string,
    used: Set<string>,
  ): string {
    const base = stripAccents(
      name.charAt(0).toLowerCase() + firstLastName.toLowerCase().replace(/\s/g, ""),
    );
    if (!used.has(base)) {
      used.add(base);
      return base;
    }
    let suffix = 1;
    while (used.has(`${base}${suffix}`)) suffix++;
    const username = `${base}${suffix}`;
    used.add(username);
    return username;
  }

  function buildStaffEmail(name: string, firstLastName: string, seq: number): string {
    const local = stripAccents(`${name}.${firstLastName}`)
      .toLowerCase()
      .replace(/\s+/g, "");
    return `${local}${seq}@${STAFF_EMAIL_DOMAIN}`;
  }

  // Track usernames across every employee created in this seed run (existing
  // admins included) so nothing collides.
  const usedUsernames = new Set<string>([admin1Username, admin2Username]);

  const TEACHERS_2026 = [
    { name: "Laura", firstLastName: "Fernández", secondLastName: "Ruiz", subjectKey: "espanol_1p" as const, groups: ["primaria_a", "primaria_b"] as const },
    { name: "Ricardo", firstLastName: "Salinas", secondLastName: "Ponce", subjectKey: "matematicas_1p" as const, groups: ["primaria_a", "primaria_b"] as const },
    { name: "Patricia", firstLastName: "Núñez", secondLastName: "Rivas", subjectKey: "ciencias_1p" as const, groups: ["primaria_a", "primaria_b"] as const },
    { name: "Andrés", firstLastName: "Villarreal", secondLastName: "Ochoa", subjectKey: "ingles_1p" as const, groups: ["primaria_a", "primaria_b"] as const },
    { name: "Mónica", firstLastName: "Escobar", secondLastName: "Luna", subjectKey: "historia_1p" as const, groups: ["primaria_a", "primaria_b"] as const },
    { name: "Claudia", firstLastName: "Bravo", secondLastName: "Serrano", subjectKey: "espanol_1pe" as const, groups: ["preescolar_a", "preescolar_b"] as const },
    { name: "Fernando", firstLastName: "Aguilar", secondLastName: "Campos", subjectKey: "matematicas_1pe" as const, groups: ["preescolar_a", "preescolar_b"] as const },
    { name: "Gabriela", firstLastName: "Soto", secondLastName: "Delgado", subjectKey: "ingles_1pe" as const, groups: ["preescolar_a", "preescolar_b"] as const },
    { name: "Rosa", firstLastName: "Ibarra", secondLastName: "Montes", subjectKey: "expresion_1pe" as const, groups: ["preescolar_a"] as const },
    { name: "Diego", firstLastName: "Paredes", secondLastName: "Cabrera", subjectKey: "expresion_1pe" as const, groups: ["preescolar_b"] as const },
  ];

  const teacherPassword = await bcrypt.hash("Docente123!", BCRYPT_ROUNDS);

  // Resolved teacher records (with the created employeeId) — used below to
  // wire up the class schedule (calendar entries).
  const resolvedTeachers: Array<
    (typeof TEACHERS_2026)[number] & { employeeId: string }
  > = [];

  for (let i = 0; i < TEACHERS_2026.length; i++) {
    const t = TEACHERS_2026[i]!;
    const username = buildUsername(t.name, t.firstLastName, usedUsernames);
    const email = buildStaffEmail(t.name, t.firstLastName, i + 1);
    const employee = await prisma.employee.upsert({
      where: { email },
      update: {},
      create: {
        name: t.name,
        firstLastName: t.firstLastName,
        secondLastName: t.secondLastName,
        phoneNumber: `55100${String(20000 + i).padStart(5, "0")}`,
        email,
        username,
        password: teacherPassword,
        mustChangePassword: false,
        isActive: true,
        securityRoleId: docenteRole.id,
        jobTitleId: JOB_TITLES.docente,
      },
    });
    resolvedTeachers.push({ ...t, employeeId: employee.id });
  }

  console.log(`  ✓ Teacher employees: ${TEACHERS_2026.length} records`);

  const ADMIN_STAFF_2026 = [
    {
      name: "Beatriz",
      firstLastName: "Molina",
      secondLastName: "Reyes",
      jobTitleId: JOB_TITLES.auxiliar_administrativo,
      securityRoleId: auxiliarRole.id,
    },
    {
      name: "Jorge",
      firstLastName: "Salcedo",
      secondLastName: "Torres",
      jobTitleId: JOB_TITLES.auxiliar_administrativo,
      securityRoleId: auxiliarRole.id,
    },
    {
      name: "Karla",
      firstLastName: "Espinoza",
      secondLastName: "Duarte",
      jobTitleId: JOB_TITLES.coordinador,
      securityRoleId: coordinadorRole.id,
    },
  ];

  const adminStaffPassword = await bcrypt.hash("Admin789!", BCRYPT_ROUNDS);

  for (let i = 0; i < ADMIN_STAFF_2026.length; i++) {
    const s = ADMIN_STAFF_2026[i]!;
    const username = buildUsername(s.name, s.firstLastName, usedUsernames);
    const email = buildStaffEmail(s.name, s.firstLastName, i + 1 + TEACHERS_2026.length);
    await prisma.employee.upsert({
      where: { email },
      update: {},
      create: {
        name: s.name,
        firstLastName: s.firstLastName,
        secondLastName: s.secondLastName,
        phoneNumber: `55200${String(30000 + i).padStart(5, "0")}`,
        email,
        username,
        password: adminStaffPassword,
        mustChangePassword: false,
        isActive: true,
        securityRoleId: s.securityRoleId,
        jobTitleId: s.jobTitleId,
      },
    });
  }

  console.log(`  ✓ Administrative staff employees: ${ADMIN_STAFF_2026.length} records`);

  // --- Academic Levels ---
  const preescolar = await prisma.academicLevel.upsert({
    where: { id: ACADEMIC_LEVELS.preescolar },
    update: {},
    create: {
      id: ACADEMIC_LEVELS.preescolar,
      name: "Preescolar",
      description: "Educación preescolar (3 grados)",
      isActive: true,
    },
  });
  const primaria = await prisma.academicLevel.upsert({
    where: { id: ACADEMIC_LEVELS.primaria },
    update: {},
    create: {
      id: ACADEMIC_LEVELS.primaria,
      name: "Primaria",
      description: "Educación primaria básica (6 grados)",
      isActive: true,
    },
  });
  const secundaria = await prisma.academicLevel.upsert({
    where: { id: ACADEMIC_LEVELS.secundaria },
    update: {},
    create: {
      id: ACADEMIC_LEVELS.secundaria,
      name: "Secundaria",
      description: "Educación secundaria básica (3 grados)",
      isActive: true,
    },
  });
  console.log(
    `  ✓ Academic levels: ${preescolar.name}, ${primaria.name}, ${secundaria.name}`,
  );

  // --- Education Levels ---
  const primeroPre = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.primero_preescolar },
    update: {},
    create: {
      id: EDUCATION_LEVELS.primero_preescolar,
      name: "1° Preescolar",
      description: "Primer grado de preescolar",
      academicLevelId: preescolar.id,
    },
  });
  const segundoPre = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.segundo_preescolar },
    update: {},
    create: {
      id: EDUCATION_LEVELS.segundo_preescolar,
      name: "2° Preescolar",
      description: "Segundo grado de preescolar",
      academicLevelId: preescolar.id,
    },
  });
  const primeroPri = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.primero_primaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.primero_primaria,
      name: "1° Primaria",
      description: "Primer grado de primaria",
      academicLevelId: primaria.id,
    },
  });
  const segundoPri = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.segundo_primaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.segundo_primaria,
      name: "2° Primaria",
      description: "Segundo grado de primaria",
      academicLevelId: primaria.id,
    },
  });
  const primeroSec = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.primero_secundaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.primero_secundaria,
      name: "1° Secundaria",
      description: "Primer grado de secundaria",
      academicLevelId: secundaria.id,
    },
  });
  const segundoSec = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.segundo_secundaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.segundo_secundaria,
      name: "2° Secundaria",
      description: "Segundo grado de secundaria",
      academicLevelId: secundaria.id,
    },
  });
  console.log(
    `  ✓ Education levels: ${primeroPre.name}, ${segundoPre.name}, ${primeroPri.name}, ${segundoPri.name}, ${primeroSec.name}, ${segundoSec.name}`,
  );

  // --- School Subjects ---
  await Promise.all([
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Matemáticas",
          educationLevelId: primeroPri.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_1p,
        name: "Matemáticas",
        description: "Desarrollo del pensamiento lógico-matemático",
        isActive: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPri.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Español",
          educationLevelId: primeroPri.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.espanol_1p,
        name: "Español",
        description: "Lectura, escritura y comunicación oral",
        isActive: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPri.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Ciencias Naturales",
          educationLevelId: primeroPri.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.ciencias_1p,
        name: "Ciencias Naturales",
        description: "Exploración del mundo natural",
        isActive: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPri.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Matemáticas",
          educationLevelId: segundoPri.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_2p,
        name: "Matemáticas",
        description: "Aritmética, geometría y resolución de problemas",
        isActive: true,
        academicLevelId: primaria.id,
        educationLevelId: segundoPri.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Matemáticas",
          educationLevelId: primeroSec.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_1s,
        name: "Matemáticas",
        description: "Álgebra, funciones y pensamiento abstracto",
        isActive: true,
        academicLevelId: secundaria.id,
        educationLevelId: primeroSec.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Historia",
          educationLevelId: primeroSec.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.historia_1s,
        name: "Historia",
        description: "Historia de México y del mundo",
        isActive: true,
        academicLevelId: secundaria.id,
        educationLevelId: primeroSec.id,
      },
    }),
  ]);
  console.log("  ✓ School subjects: 6 records");

  // --- Scholarships ---
  await Promise.all([
    prisma.scholarship.upsert({
      where: { id: SCHOLARSHIPS.excelencia_academica },
      update: {},
      create: {
        id: SCHOLARSHIPS.excelencia_academica,
        name: "Beca Excelencia Académica",
        description: "Beca para estudiantes con promedio sobresaliente",
        discountPercentage: 50,
        isActive: true,
      },
    }),
    prisma.scholarship.upsert({
      where: { id: SCHOLARSHIPS.deportiva },
      update: {},
      create: {
        id: SCHOLARSHIPS.deportiva,
        name: "Beca Deportiva",
        description: "Beca para representantes deportivos del colegio",
        discountPercentage: 30,
        isActive: true,
      },
    }),
    prisma.scholarship.upsert({
      where: { id: SCHOLARSHIPS.hermanos },
      update: {},
      create: {
        id: SCHOLARSHIPS.hermanos,
        name: "Beca Hermanos",
        description: "Descuento para familias con dos o más hermanos inscritos",
        discountPercentage: 15,
        isActive: true,
      },
    }),
    prisma.scholarship.upsert({
      where: { id: SCHOLARSHIPS.necesidad_economica },
      update: {},
      create: {
        id: SCHOLARSHIPS.necesidad_economica,
        name: "Beca Necesidad Económica",
        description: "Apoyo para familias con necesidad económica comprobable",
        discountPercentage: 80,
        isActive: true,
      },
    }),
  ]);
  console.log("  ✓ Scholarships: 4 records");

  // --- Payment Concepts ---
  await Promise.all([
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.inscripcion },
      update: { code: "INSCRIP" },
      create: {
        id: PAYMENT_CONCEPTS.inscripcion,
        name: "Inscripción",
        code: "INSCRIP",
        description: "Cuota de inscripción al ciclo escolar",
        amount: 3500.0,
        allowForgiveness: true,
        isActive: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.colegiatura_mensual },
      update: { code: "COLEGMES" },
      create: {
        id: PAYMENT_CONCEPTS.colegiatura_mensual,
        name: "Colegiatura mensual",
        code: "COLEGMES",
        description: "Pago mensual de colegiatura",
        amount: 4200.0,
        allowForgiveness: true,
        isActive: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.material_didactico },
      update: { code: "MATERIAL" },
      create: {
        id: PAYMENT_CONCEPTS.material_didactico,
        name: "Material didáctico",
        code: "MATERIAL",
        description: "Costo de materiales educativos del ciclo",
        amount: 1800.0,
        allowForgiveness: false,
        isActive: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.uniforme_escolar },
      update: { code: "UNIFORME" },
      create: {
        id: PAYMENT_CONCEPTS.uniforme_escolar,
        name: "Uniforme escolar",
        code: "UNIFORME",
        description: "Paquete completo de uniforme escolar",
        amount: 2500.0,
        allowForgiveness: false,
        isActive: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.seguro_escolar },
      update: { code: "SEGURO" },
      create: {
        id: PAYMENT_CONCEPTS.seguro_escolar,
        name: "Seguro escolar",
        code: "SEGURO",
        description: "Seguro de accidentes y gastos médicos escolares",
        amount: 950.0,
        allowForgiveness: false,
        isActive: true,
      },
    }),
  ]);
  console.log("  ✓ Payment concepts: 5 records");

  // ─── Realistic 2026 dataset: subjects, cycle, groups, schedule, wallet, students ─

  // --- New School Subjects (2026 dataset) ---
  await Promise.all([
    prisma.schoolSubject.upsert({
      where: { name_educationLevelId: { name: "Historia", educationLevelId: primeroPri.id } },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.historia_1p,
        name: "Historia",
        description: "Historia de México, línea del tiempo y hechos relevantes",
        isActive: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPri.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: { name_educationLevelId: { name: "Inglés", educationLevelId: primeroPri.id } },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.ingles_1p,
        name: "Inglés",
        description: "Vocabulario básico y comprensión auditiva en inglés",
        isActive: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPri.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: { name_educationLevelId: { name: "Español", educationLevelId: primeroPre.id } },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.espanol_1pe,
        name: "Español",
        description: "Lenguaje oral, cuentos y primeras grafías",
        isActive: true,
        academicLevelId: preescolar.id,
        educationLevelId: primeroPre.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: { name_educationLevelId: { name: "Matemáticas", educationLevelId: primeroPre.id } },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_1pe,
        name: "Matemáticas",
        description: "Conteo, formas y nociones básicas de cantidad",
        isActive: true,
        academicLevelId: preescolar.id,
        educationLevelId: primeroPre.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: { name_educationLevelId: { name: "Inglés", educationLevelId: primeroPre.id } },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.ingles_1pe,
        name: "Inglés",
        description: "Introducción lúdica al idioma inglés",
        isActive: true,
        academicLevelId: preescolar.id,
        educationLevelId: primeroPre.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: { name: "Expresión y Creatividad", educationLevelId: primeroPre.id },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.expresion_1pe,
        name: "Expresión y Creatividad",
        description: "Actividades artísticas, motrices y de expresión personal",
        isActive: true,
        academicLevelId: preescolar.id,
        educationLevelId: primeroPre.id,
      },
    }),
  ]);
  console.log("  ✓ School subjects (2026 dataset): 6 records");

  // --- Academic Cycles (2026) ---
  const primariaCycle = await prisma.academicCycle.upsert({
    where: { id: ACADEMIC_CYCLES_2026.primaria },
    update: {},
    create: {
      id: ACADEMIC_CYCLES_2026.primaria,
      name: "Primaria 2026",
      code: "PRI-2026",
      startDate: new Date("2026-08-24T00:00:00.000Z"),
      endDate: new Date("2027-07-09T00:00:00.000Z"),
      periodType: "annual",
      status: "active",
      minimumPassingGrade: 6,
      evaluationCount: 3,
      enrollmentOpen: true,
      observations: "Ciclo escolar 2026-2027, primer grado de primaria.",
      academicLevelId: primaria.id,
      educationLevelId: primeroPri.id,
    },
  });

  const preescolarCycle = await prisma.academicCycle.upsert({
    where: { id: ACADEMIC_CYCLES_2026.preescolar },
    update: {},
    create: {
      id: ACADEMIC_CYCLES_2026.preescolar,
      name: "Preescolar 2026",
      code: "PRE-2026",
      startDate: new Date("2026-08-24T00:00:00.000Z"),
      endDate: new Date("2027-07-09T00:00:00.000Z"),
      periodType: "annual",
      status: "active",
      minimumPassingGrade: 6,
      evaluationCount: 3,
      enrollmentOpen: true,
      observations: "Ciclo escolar 2026-2027, primer grado de preescolar.",
      academicLevelId: preescolar.id,
      educationLevelId: primeroPre.id,
    },
  });

  console.log(`  ✓ Academic cycles: ${primariaCycle.name}, ${preescolarCycle.name}`);

  // --- Academic Cycle Groups (A/B per cycle) ---
  const groupPrimariaA = await prisma.academicCycleGroup.upsert({
    where: { id: ACADEMIC_CYCLE_GROUPS_2026.primaria_a },
    update: {},
    create: {
      id: ACADEMIC_CYCLE_GROUPS_2026.primaria_a,
      name: "1° A Primaria",
      status: "active",
      academicCycleId: primariaCycle.id,
    },
  });
  const groupPrimariaB = await prisma.academicCycleGroup.upsert({
    where: { id: ACADEMIC_CYCLE_GROUPS_2026.primaria_b },
    update: {},
    create: {
      id: ACADEMIC_CYCLE_GROUPS_2026.primaria_b,
      name: "1° B Primaria",
      status: "active",
      academicCycleId: primariaCycle.id,
    },
  });
  const groupPreescolarA = await prisma.academicCycleGroup.upsert({
    where: { id: ACADEMIC_CYCLE_GROUPS_2026.preescolar_a },
    update: {},
    create: {
      id: ACADEMIC_CYCLE_GROUPS_2026.preescolar_a,
      name: "1° A Preescolar",
      status: "active",
      academicCycleId: preescolarCycle.id,
    },
  });
  const groupPreescolarB = await prisma.academicCycleGroup.upsert({
    where: { id: ACADEMIC_CYCLE_GROUPS_2026.preescolar_b },
    update: {},
    create: {
      id: ACADEMIC_CYCLE_GROUPS_2026.preescolar_b,
      name: "1° B Preescolar",
      status: "active",
      academicCycleId: preescolarCycle.id,
    },
  });

  const GROUPS_BY_KEY = {
    primaria_a: groupPrimariaA,
    primaria_b: groupPrimariaB,
    preescolar_a: groupPreescolarA,
    preescolar_b: groupPreescolarB,
  } as const;

  console.log("  ✓ Academic cycle groups: 4 records (A/B × 2 cycles)");

  // --- Academic Cycle School Subjects (per-cycle subject catalog copy) ---
  // Calendar entries below reference these associations, not the global
  // SchoolSubject catalog directly — a class can only be scheduled for a
  // subject that was actually added to its academic cycle first.
  const academicCycleSchoolSubjectsBySubjectKey = Object.fromEntries(
    await Promise.all(
      (
        [
          ["primaria_espanol_1p", primariaCycle.id, SCHOOL_SUBJECTS.espanol_1p],
          ["primaria_matematicas_1p", primariaCycle.id, SCHOOL_SUBJECTS.matematicas_1p],
          ["primaria_ciencias_1p", primariaCycle.id, SCHOOL_SUBJECTS.ciencias_1p],
          ["primaria_ingles_1p", primariaCycle.id, SCHOOL_SUBJECTS.ingles_1p],
          ["primaria_historia_1p", primariaCycle.id, SCHOOL_SUBJECTS.historia_1p],
          ["preescolar_espanol_1pe", preescolarCycle.id, SCHOOL_SUBJECTS.espanol_1pe],
          ["preescolar_matematicas_1pe", preescolarCycle.id, SCHOOL_SUBJECTS.matematicas_1pe],
          ["preescolar_ingles_1pe", preescolarCycle.id, SCHOOL_SUBJECTS.ingles_1pe],
          ["preescolar_expresion_1pe", preescolarCycle.id, SCHOOL_SUBJECTS.expresion_1pe],
        ] as const
      ).map(async ([key, academicCycleId, schoolSubjectId]) => {
        // Keyed on the (academicCycleId, schoolSubjectId) unique constraint,
        // not on id: a prior run of the calendar->cycle-subject migration's
        // auto-heal step may have already created this association (with a
        // random id) from pre-existing calendar rows.
        const association = await prisma.academicCycleSchoolSubject.upsert({
          where: {
            academicCycleId_schoolSubjectId: { academicCycleId, schoolSubjectId },
          },
          update: {},
          create: {
            id: ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026[
              key as keyof typeof ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026
            ],
            academicCycleId,
            schoolSubjectId,
          },
        });
        return [key, association] as const;
      }),
    ),
  ) as unknown as Record<
    keyof typeof ACADEMIC_CYCLE_SCHOOL_SUBJECTS_2026,
    { id: string }
  >;

  console.log(
    `  ✓ Academic cycle school subjects: ${Object.keys(academicCycleSchoolSubjectsBySubjectKey).length} records`,
  );

  // --- Class schedule (calendar entries) ---
  // Group A runs 08:00-09:00, Group B runs 09:00-10:00 on the same weekday
  // for the same subject/teacher — same teacher, no time conflict.
  const PRIMARIA_SCHEDULE = [
    { day: "monday", subjectKey: "espanol_1p" },
    { day: "tuesday", subjectKey: "matematicas_1p" },
    { day: "wednesday", subjectKey: "ciencias_1p" },
    { day: "thursday", subjectKey: "ingles_1p" },
    { day: "friday", subjectKey: "historia_1p" },
  ] as const;
  const PRIMARIA_SUBJECT_KEYS = Array.from(
    new Set(PRIMARIA_SCHEDULE.map((s) => s.subjectKey)),
  ) as (keyof typeof SCHOOL_SUBJECTS)[];
  const PREESCOLAR_SCHEDULE = [
    { day: "monday", subjectKey: "espanol_1pe" },
    { day: "tuesday", subjectKey: "matematicas_1pe" },
    { day: "wednesday", subjectKey: "ingles_1pe" },
    { day: "thursday", subjectKey: "expresion_1pe" },
  ] as const;
  const PREESCOLAR_SUBJECT_KEYS = Array.from(
    new Set(PREESCOLAR_SCHEDULE.map((s) => s.subjectKey)),
  ) as (keyof typeof SCHOOL_SUBJECTS)[];

  function findTeacher(subjectKey: string, groupKey: string) {
    const teacher = resolvedTeachers.find(
      (t) => t.subjectKey === subjectKey && (t.groups as readonly string[]).includes(groupKey),
    );
    if (!teacher) {
      throw new Error(`No teacher found for ${subjectKey} / ${groupKey}`);
    }
    return teacher;
  }

  let calendarSeq = 0;
  const calendarEntries: {
    id: string;
    day: DayOfWeek;
    startTime: Date;
    endTime: Date;
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    academicCycleSchoolSubjectId: string;
    teacherId: string;
  }[] = [];

  for (const [groupKey, group] of [
    ["primaria_a", groupPrimariaA],
    ["primaria_b", groupPrimariaB],
  ] as const) {
    const startTime = groupKey === "primaria_a" ? "08:00" : "09:00";
    const endTime = groupKey === "primaria_a" ? "09:00" : "10:00";
    for (const slot of PRIMARIA_SCHEDULE) {
      calendarSeq++;
      const teacher = findTeacher(slot.subjectKey, groupKey);
      const academicCycleSchoolSubject =
        academicCycleSchoolSubjectsBySubjectKey[
          `primaria_${slot.subjectKey}` as keyof typeof academicCycleSchoolSubjectsBySubjectKey
        ];
      calendarEntries.push({
        id: `ee000000-0011-4000-8000-${String(calendarSeq).padStart(12, "0")}`,
        day: slot.day,
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
        academicCycleId: primariaCycle.id,
        academicCycleSchoolGroupId: group.id,
        academicCycleSchoolSubjectId: academicCycleSchoolSubject.id,
        teacherId: teacher.employeeId,
      });
    }
  }

  for (const [groupKey, group] of [
    ["preescolar_a", groupPreescolarA],
    ["preescolar_b", groupPreescolarB],
  ] as const) {
    const startTime = groupKey === "preescolar_a" ? "08:00" : "09:00";
    const endTime = groupKey === "preescolar_a" ? "09:00" : "10:00";
    for (const slot of PREESCOLAR_SCHEDULE) {
      calendarSeq++;
      const teacher = findTeacher(slot.subjectKey, groupKey);
      const academicCycleSchoolSubject =
        academicCycleSchoolSubjectsBySubjectKey[
          `preescolar_${slot.subjectKey}` as keyof typeof academicCycleSchoolSubjectsBySubjectKey
        ];
      calendarEntries.push({
        id: `ee000000-0011-4000-8000-${String(calendarSeq).padStart(12, "0")}`,
        day: slot.day,
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
        academicCycleId: preescolarCycle.id,
        academicCycleSchoolGroupId: group.id,
        academicCycleSchoolSubjectId: academicCycleSchoolSubject.id,
        teacherId: teacher.employeeId,
      });
    }
  }

  for (const entry of calendarEntries) {
    await prisma.academicCycleGroupCalendar.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }

  console.log(`  ✓ Class schedule: ${calendarEntries.length} calendar entries`);

  // --- Wallet catalog (2026 cycles): inscripción, mantenimiento, material ---
  const walletPrimaria = {
    inscripcion: await prisma.academicCycleWallet.upsert({
      where: { id: WALLET_CATALOG_2026.primaria_inscripcion },
      update: {},
      create: {
        id: WALLET_CATALOG_2026.primaria_inscripcion,
        academicCycleId: primariaCycle.id,
        name: "Inscripción",
        code: "INSCRIP",
        description: "Cuota única de inscripción al ciclo escolar",
        dueDate: new Date("2026-08-01T00:00:00.000Z"),
        amount: 3500.0,
        allowForgiveness: true,
      },
    }),
    mantenimiento: await prisma.academicCycleWallet.upsert({
      where: { id: WALLET_CATALOG_2026.primaria_mantenimiento },
      update: {},
      create: {
        id: WALLET_CATALOG_2026.primaria_mantenimiento,
        academicCycleId: primariaCycle.id,
        name: "Mantenimiento mensual",
        code: "MANTEN",
        description: "Cuota mensual de mantenimiento e instalaciones",
        dueDate: new Date("2026-09-05T00:00:00.000Z"),
        amount: 1500.0,
        allowForgiveness: true,
      },
    }),
    material: await prisma.academicCycleWallet.upsert({
      where: { id: WALLET_CATALOG_2026.primaria_material },
      update: {},
      create: {
        id: WALLET_CATALOG_2026.primaria_material,
        academicCycleId: primariaCycle.id,
        name: "Material didáctico",
        code: "MATERIAL",
        description: "Paquete de material didáctico del ciclo",
        dueDate: new Date("2026-08-15T00:00:00.000Z"),
        amount: 800.0,
        allowForgiveness: false,
      },
    }),
  };

  const walletPreescolar = {
    inscripcion: await prisma.academicCycleWallet.upsert({
      where: { id: WALLET_CATALOG_2026.preescolar_inscripcion },
      update: {},
      create: {
        id: WALLET_CATALOG_2026.preescolar_inscripcion,
        academicCycleId: preescolarCycle.id,
        name: "Inscripción",
        code: "INSCRIP",
        description: "Cuota única de inscripción al ciclo escolar",
        dueDate: new Date("2026-08-01T00:00:00.000Z"),
        amount: 3200.0,
        allowForgiveness: true,
      },
    }),
    mantenimiento: await prisma.academicCycleWallet.upsert({
      where: { id: WALLET_CATALOG_2026.preescolar_mantenimiento },
      update: {},
      create: {
        id: WALLET_CATALOG_2026.preescolar_mantenimiento,
        academicCycleId: preescolarCycle.id,
        name: "Mantenimiento mensual",
        code: "MANTEN",
        description: "Cuota mensual de mantenimiento e instalaciones",
        dueDate: new Date("2026-09-05T00:00:00.000Z"),
        amount: 1300.0,
        allowForgiveness: true,
      },
    }),
    material: await prisma.academicCycleWallet.upsert({
      where: { id: WALLET_CATALOG_2026.preescolar_material },
      update: {},
      create: {
        id: WALLET_CATALOG_2026.preescolar_material,
        academicCycleId: preescolarCycle.id,
        name: "Material didáctico",
        code: "MATERIAL",
        description: "Paquete de material didáctico del ciclo",
        dueDate: new Date("2026-08-15T00:00:00.000Z"),
        amount: 700.0,
        allowForgiveness: false,
      },
    }),
  };

  console.log("  ✓ Wallet catalog: 6 records (3 × 2 cycles)");

  // --- Students, guardians, enrollments, wallet items & payments ─────────────

  const MALE_NAMES = [
    "Diego", "Santiago", "Mateo", "Sebastián", "Emiliano", "Leonardo", "Daniel",
    "Alejandro", "Gael", "Ángel", "Miguel", "Luis", "Carlos", "David", "Jorge",
    "Fernando", "Ricardo", "Iker", "Bruno", "Adrián",
  ];
  const FEMALE_NAMES = [
    "Sofía", "Valentina", "Ximena", "Camila", "Regina", "Renata", "Victoria",
    "Fernanda", "Daniela", "Paulina", "Andrea", "Gabriela", "Isabella",
    "Natalia", "Lucía", "Mariana", "Valeria", "Emilia", "Ana", "María",
  ];
  const LAST_NAMES = [
    "García", "Hernández", "López", "Martínez", "González", "Pérez",
    "Rodríguez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
    "Díaz", "Cruz", "Morales", "Reyes", "Jiménez", "Ortiz", "Gutiérrez",
    "Chávez", "Ramos", "Mendoza", "Vázquez", "Castillo",
  ];
  const BLOOD_TYPE_VALUES = Object.values(BloodType);
  const MUNICIPALITIES = ["Benito Juárez", "Coyoacán", "Álvaro Obregón", "Tlalpan"];
  const POSTAL_CODES = ["03100", "04100", "01000", "14000"];

  function pick<T>(arr: readonly T[], seq: number): T {
    return arr[seq % arr.length]!;
  }

  /** Deterministic 18-char placeholder CURP (not a real/valid checksum, just unique). */
  function buildCurp(seq: number, sex: "H" | "M"): string {
    const n = String(seq).padStart(4, "0");
    return `SEED${n}010101${sex}DF${n.slice(-1)}`; // 4+4+6+1+2+1 = 18 chars
  }

  function buildStudentEmail(name: string, lastName: string, seq: number): string {
    const local = stripAccents(`${name}.${lastName}${seq}`).toLowerCase();
    return `${local}@colegiolear.com.mx`;
  }

  function buildPhone(base: number, seq: number): string {
    return String(base + seq).padStart(10, "0");
  }

  const ALLERGY_CATALOG = [
    { name: "Polvo", severity: "mild" as const },
    { name: "Polen", severity: "mild" as const },
    { name: "Pelo de gato", severity: "mild" as const },
    { name: "Lactosa", severity: "moderate" as const },
    { name: "Huevo", severity: "moderate" as const },
    { name: "Penicilina", severity: "severe" as const },
    { name: "Mariscos", severity: "severe" as const },
    { name: "Cacahuate", severity: "severe" as const },
    { name: "Picadura de abeja", severity: "severe" as const },
  ];

  /** ~1/3 of students get one allergy, ~1/9 get a second one (deduped). */
  function buildAllergiesForStudent(seq: number): (typeof ALLERGY_CATALOG)[number][] {
    if (seq % 3 !== 0) return [];
    const assigned = [pick(ALLERGY_CATALOG, seq)];
    if (seq % 9 === 0) {
      const second = pick(ALLERGY_CATALOG, seq + 4);
      if (second.name !== assigned[0]!.name) assigned.push(second);
    }
    return assigned;
  }

  // Grade values, weighted toward passing (minimumPassingGrade: 6) but with
  // enough failing entries (5.0-5.75) to show realistic variety in the UI.
  const GRADE_VARIANTS = [
    10.0, 9.5, 9.0, 8.75, 8.5, 8.0, 7.75, 7.5, 7.0, 6.75, 6.5, 6.0, 5.75, 5.5, 5.0,
  ] as const;
  function buildGrade(seed: number): number {
    return GRADE_VARIANTS[seed % GRADE_VARIANTS.length]!;
  }

  const studentPassword = await bcrypt.hash("Estudiante123!", BCRYPT_ROUNDS);

  interface GroupSeedConfig {
    key: keyof typeof GROUPS_BY_KEY;
    cycle: typeof primariaCycle;
    wallet: typeof walletPrimaria;
    birthYear: number;
    subjectKeys: (keyof typeof SCHOOL_SUBJECTS)[];
  }

  const GROUP_CONFIGS: GroupSeedConfig[] = [
    { key: "primaria_a", cycle: primariaCycle, wallet: walletPrimaria, birthYear: 2019, subjectKeys: PRIMARIA_SUBJECT_KEYS },
    { key: "primaria_b", cycle: primariaCycle, wallet: walletPrimaria, birthYear: 2019, subjectKeys: PRIMARIA_SUBJECT_KEYS },
    { key: "preescolar_a", cycle: preescolarCycle, wallet: walletPreescolar, birthYear: 2022, subjectKeys: PREESCOLAR_SUBJECT_KEYS },
    { key: "preescolar_b", cycle: preescolarCycle, wallet: walletPreescolar, birthYear: 2022, subjectKeys: PREESCOLAR_SUBJECT_KEYS },
  ];

  const STUDENTS_PER_GROUP = 18;
  let enrollmentSeq = 0;
  let paymentSeq = 0;
  let globalStudentSeq = 0;

  let totalPaidCount = 0;
  let totalScholarshipCount = 0;
  let totalForgivenCount = 0;
  let totalPendingCount = 0;
  let totalAllergiesCreated = 0;
  let totalGradesCreated = 0;

  for (const config of GROUP_CONFIGS) {
    const group = GROUPS_BY_KEY[config.key];

    for (let i = 0; i < STUDENTS_PER_GROUP; i++) {
      globalStudentSeq++;
      const isMale = globalStudentSeq % 2 === 0;
      const studentName = isMale ? pick(MALE_NAMES, globalStudentSeq) : pick(FEMALE_NAMES, globalStudentSeq);
      const firstLastName = pick(LAST_NAMES, globalStudentSeq);
      const secondLastName = pick(LAST_NAMES, globalStudentSeq + 7);
      const curp = buildCurp(globalStudentSeq, isMale ? "H" : "M");
      const email = buildStudentEmail(studentName, firstLastName, globalStudentSeq);
      const enrollmentCode = `LR-2026-${String(globalStudentSeq).padStart(4, "0")}`;

      // category: 0,1,2 -> fully paid; 3 -> scholarship; 4 -> forgiven; 5 -> pending
      const category = i % 6;
      const assignedAllergies = buildAllergiesForStudent(globalStudentSeq);
      const hasSevereAllergy = assignedAllergies.some((a) => a.severity === "severe");

      const student = await prisma.student.upsert({
        where: { email },
        update: {},
        create: {
          name: studentName,
          firstLastName,
          secondLastName,
          dateOfBirth: new Date(
            Date.UTC(config.birthYear, globalStudentSeq % 12, 1 + (globalStudentSeq % 27)),
          ),
          curp,
          enrollment: enrollmentCode,
          observations: null,
          bloodType: pick(BLOOD_TYPE_VALUES, globalStudentSeq),
          medicalNotes: hasSevereAllergy
            ? "Alumno con alergia severa; revisar expediente médico antes de excursiones o eventos con alimentos."
            : null,
          email,
          phoneNumber: buildPhone(5520000000, globalStudentSeq),
          address: `Calle Primavera ${100 + globalStudentSeq}, Col. Del Valle`,
          state: "Ciudad de México",
          municipality: pick(MUNICIPALITIES, globalStudentSeq),
          postalCode: pick(POSTAL_CODES, globalStudentSeq),
          password: studentPassword,
          mustChangePassword: true,
          isActive: true,
        },
      });

      // Guardian (principal) — only create if this student doesn't have one yet
      const existingGuardian = await prisma.studentGuardian.findFirst({
        where: { studentId: student.id },
      });
      if (!existingGuardian) {
        const guardianName = pick(FEMALE_NAMES, globalStudentSeq + 3);
        const guardianLastName = firstLastName;
        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            fullName: `${guardianName} ${guardianLastName} ${pick(LAST_NAMES, globalStudentSeq + 11)}`,
            relationship: globalStudentSeq % 2 === 0 ? "mother" : "father",
            phoneNumber: buildPhone(5530000000, globalStudentSeq),
            email: `tutor.${buildStudentEmail(guardianName, guardianLastName, globalStudentSeq)}`,
            isPrincipal: true,
            emergencyContact: true,
            authorizedToPickUp: true,
            observations: null,
          },
        });
      }

      // Allergies — only create if this student doesn't have any yet
      const existingAllergies = await prisma.studentAllergy.count({
        where: { studentId: student.id },
      });
      if (existingAllergies === 0) {
        for (const allergy of assignedAllergies) {
          await prisma.studentAllergy.create({
            data: {
              studentId: student.id,
              name: allergy.name,
              severity: allergy.severity,
              observations:
                allergy.severity === "severe"
                  ? "Llevar siempre el medicamento de emergencia indicado por el médico."
                  : null,
            },
          });
          totalAllergiesCreated++;
        }
      }

      // Enrollment — only create if this student isn't already enrolled in this cycle
      let enrollment = await prisma.academicCycleEnrollment.findFirst({
        where: { studentId: student.id, academicCycleId: config.cycle.id },
      });
      const scholarshipId =
        category === 3
          ? ([
              SCHOLARSHIPS.excelencia_academica,
              SCHOLARSHIPS.deportiva,
              SCHOLARSHIPS.hermanos,
              SCHOLARSHIPS.necesidad_economica,
            ][globalStudentSeq % 4] ?? null)
          : null;

      if (!enrollment) {
        enrollmentSeq++;
        // AcademicCycleEnrollment.code follows the app's real "INS-YYYY-####"
        // convention (see AcademicCycleEnrollmentService.generateCode) — distinct
        // from the student's own "LR-YYYY-####" enrollment folio.
        const academicCycleEnrollmentCode = `INS-2026-${String(enrollmentSeq).padStart(4, "0")}`;
        enrollment = await prisma.academicCycleEnrollment.create({
          data: {
            code: academicCycleEnrollmentCode,
            status: "enrolled",
            studentId: student.id,
            academicCycleId: config.cycle.id,
            academicCycleSchoolGroupId: group.id,
            scholarshipId,
          },
        });
      }

      // Wallet items snapshot (inscripción, mantenimiento, material) — only
      // if this enrollment doesn't have them yet.
      const existingItems = await prisma.studentWalletItem.count({
        where: { academicCycleEnrollmentId: enrollment.id },
      });

      if (existingItems === 0) {
        let discountRate = 0;
        if (scholarshipId) {
          const scholarship = await prisma.scholarship.findUnique({
            where: { id: scholarshipId },
          });
          discountRate = Number(scholarship?.discountPercentage ?? 0) / 100;
        }

        const walletEntries = [
          config.wallet.inscripcion,
          config.wallet.mantenimiento,
          config.wallet.material,
        ];

        for (let w = 0; w < walletEntries.length; w++) {
          const catalogItem = walletEntries[w]!;
          const baseAmount = Number(catalogItem.amount);
          const amount = discountRate > 0 ? Math.round(baseAmount * (1 - discountRate) * 100) / 100 : baseAmount;

          // Forgiven category: forgive the "mantenimiento" item (index 1) only.
          const isForgiven = category === 4 && w === 1;
          let outstandingAmount = amount;
          if (isForgiven) {
            outstandingAmount = 0;
          } else if (category === 0 || category === 1 || category === 2 || category === 3) {
            // fully paid (also applies to scholarship students, at the discounted rate)
            outstandingAmount = 0;
          } else if (category === 5) {
            // pending: 40% paid, 60% still outstanding
            outstandingAmount = Math.round(amount * 0.6 * 100) / 100;
          } else if (category === 4) {
            // forgiven category, non-forgiven items: fully paid
            outstandingAmount = 0;
          }

          const item = await prisma.studentWalletItem.create({
            data: {
              name: catalogItem.name,
              code: catalogItem.code,
              description: catalogItem.description,
              amount,
              allowForgiveness: catalogItem.allowForgiveness,
              outstandingAmount,
              isForgiven,
              dueDate: catalogItem.dueDate,
              studentId: student.id,
              academicCycleId: config.cycle.id,
              academicCycleEnrollmentId: enrollment.id,
              academicCycleWalletId: catalogItem.id,
            },
          });

          // Register a payment for the portion actually paid (amount - outstanding)
          const paidAmount = Math.round((amount - outstandingAmount) * 100) / 100;
          if (paidAmount > 0) {
            paymentSeq++;
            await prisma.studentWalletPayment.create({
              data: {
                folio: `PAG-2026-${String(paymentSeq).padStart(6, "0")}`,
                amount: paidAmount,
                paymentMethod: paymentSeq % 2 === 0 ? "online_payment" : "cash",
                academicCycleId: config.cycle.id,
                academicCycleEnrollmentId: enrollment.id,
                studentWalletItemId: item.id,
              },
            });
          }
        }
      }

      // Grades — only create if this enrollment doesn't have them yet. One
      // grade per subject taught to this group × the cycle's 3 evaluations.
      const existingGrades = await prisma.studentGrade.count({
        where: { academicCycleEnrollmentId: enrollment.id },
      });
      if (existingGrades === 0) {
        const EVALUATION_COUNT = 3;
        for (let s = 0; s < config.subjectKeys.length; s++) {
          const subjectKey = config.subjectKeys[s]!;
          const schoolSubjectId = SCHOOL_SUBJECTS[subjectKey];
          for (let evaluationNumber = 1; evaluationNumber <= EVALUATION_COUNT; evaluationNumber++) {
            const gradeSeed = globalStudentSeq * 13 + s * 7 + evaluationNumber * 3;
            await prisma.studentGrade.create({
              data: {
                grade: buildGrade(gradeSeed),
                evaluationNumber,
                schoolSubjectId,
                academicCycleEnrollmentId: enrollment.id,
              },
            });
            totalGradesCreated++;
          }
        }
      }

      if (category === 3) totalScholarshipCount++;
      else if (category === 4) totalForgivenCount++;
      else if (category === 5) totalPendingCount++;
      else totalPaidCount++;
    }
  }

  console.log(
    `  ✓ Students: ${globalStudentSeq} records (${STUDENTS_PER_GROUP} × 4 groups) — ` +
      `${totalPaidCount} al corriente, ${totalScholarshipCount} con beca, ` +
      `${totalForgivenCount} con condonación, ${totalPendingCount} con saldo pendiente`,
  );
  console.log(`  ✓ Student allergies: ${totalAllergiesCreated} records`);
  console.log(`  ✓ Student grades: ${totalGradesCreated} records`);

  // --- Announcements (with realistic HTML content) ─────────────────────────

  const now = new Date();
  const inicioCursosContent = `
    <h2>¡Bienvenidos al ciclo escolar 2026-2027!</h2>
    <p>Estimadas familias, docentes y personal del Colegio Lear:</p>
    <p>Nos da mucho gusto darles la bienvenida al nuevo ciclo escolar. Las clases inician el
    <strong>lunes 24 de agosto de 2026</strong>. Les recordamos los siguientes puntos importantes:</p>
    <ul>
      <li>El horario de entrada es a las 8:00 a.m. y de salida a las 13:00 p.m.</li>
      <li>Es indispensable presentarse con el uniforme completo desde el primer día.</li>
      <li>La cuota de inscripción y el primer pago de mantenimiento deben estar cubiertos antes del inicio de clases.</li>
    </ul>
    <p>¡Les deseamos un excelente regreso a clases!</p>
    <p><em>Dirección General, Colegio Lear</em></p>
  `.trim();

  const diaMadresContent = `
    <h2>Festival del Día de las Madres 🌸</h2>
    <p>Con mucho cariño invitamos a todas las mamás de nuestra comunidad escolar al festival que
    preparamos en su honor.</p>
    <p><strong>Fecha:</strong> viernes 8 de mayo de 2026<br/>
    <strong>Hora:</strong> 9:00 a.m.<br/>
    <strong>Lugar:</strong> Patio principal del colegio</p>
    <p>Los grupos de Preescolar y Primaria prepararon un pequeño programa artístico como muestra
    de cariño y agradecimiento. ¡No falten!</p>
    <p><em>Coordinación Académica, Colegio Lear</em></p>
  `.trim();

  const vacacionesContent = `
    <h2>Periodo vacacional de verano</h2>
    <p>Les informamos que el periodo vacacional de verano será del <strong>13 de julio al 21 de
    agosto de 2026</strong>. Las actividades del nuevo ciclo escolar reinician el 24 de agosto.</p>
    <p>Aprovechamos para recordarles mantener sus datos de contacto actualizados para el próximo
    ciclo escolar.</p>
    <p><em>Dirección General, Colegio Lear</em></p>
  `.trim();

  await prisma.announcement.upsert({
    where: { id: ANNOUNCEMENTS_2026.inicio_cursos },
    update: {},
    create: {
      id: ANNOUNCEMENTS_2026.inicio_cursos,
      name: "Bienvenida — Inicio de cursos 2026-2027",
      description: "Aviso de bienvenida e inicio de clases del ciclo 2026-2027",
      audience: ["student", "teacher", "administrative-staff"],
      content: inicioCursosContent,
      publishedAt: new Date("2026-08-10T00:00:00.000Z"),
      expiresAt: new Date("2026-09-10T00:00:00.000Z"),
      isActive: true,
      recipientsCount: 98,
      viewedCount: 74,
      viewsCalculatedAt: now,
    },
  });

  await prisma.announcement.upsert({
    where: { id: ANNOUNCEMENTS_2026.dia_madres },
    update: {},
    create: {
      id: ANNOUNCEMENTS_2026.dia_madres,
      name: "Festival del Día de las Madres",
      description: "Invitación al festival del Día de las Madres",
      audience: ["student", "teacher"],
      content: diaMadresContent,
      publishedAt: new Date("2026-04-20T00:00:00.000Z"),
      expiresAt: new Date("2026-05-09T00:00:00.000Z"),
      isActive: true,
      recipientsCount: 85,
      viewedCount: 63,
      viewsCalculatedAt: now,
    },
  });

  await prisma.announcement.upsert({
    where: { id: ANNOUNCEMENTS_2026.vacaciones_verano },
    update: {},
    create: {
      id: ANNOUNCEMENTS_2026.vacaciones_verano,
      name: "Periodo vacacional de verano 2026",
      description: "Fechas del periodo vacacional de verano",
      audience: ["student", "teacher", "administrative-staff"],
      content: vacacionesContent,
      publishedAt: new Date("2026-07-01T00:00:00.000Z"),
      expiresAt: new Date("2026-08-20T00:00:00.000Z"),
      isActive: true,
      recipientsCount: 98,
      viewedCount: 51,
      viewsCalculatedAt: now,
    },
  });

  console.log("  ✓ Announcements: 3 records");

  console.log("🌱 Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

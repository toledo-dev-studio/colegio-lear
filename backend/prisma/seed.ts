import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
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
};

const SECURITY_ROLES = {
  superadmin: "aa000000-0007-4000-8000-000000000001",
  admin: "aa000000-0007-4000-8000-000000000002",
};

// ─── All module keys in the system ──────────────────────────────────────────────

const ALL_MODULE_KEYS = [
  "dashboard",
  "my-account",
  "my-classes",
  "students",
  "academic-years",
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
      status: true,
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
      status: true,
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

  console.log(`  ✓ Security roles: ${superAdminRole.name}, ${adminRole.name}`);

  // --- Job Titles ---
  const directorGeneral = await prisma.jobTitle.upsert({
    where: { id: JOB_TITLES.director_general },
    update: {},
    create: {
      id: JOB_TITLES.director_general,
      name: "Director General",
      description: "Dirección general del colegio",
      jobTitleType: "administrative_staff",
      status: true,
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
      status: true,
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
      status: true,
    },
  });

  console.log(
    "  ✓ Job titles: Director General, Coordinador Académico, Docente",
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
      status: true,
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
      status: true,
      securityRoleId: adminRole.id,
      jobTitleId: directorGeneral.id,
    },
  });

  console.log(
    `  ✓ Admin employees: ${admin1Username} (SuperAdmin), ${admin2Username} (Admin)`,
  );

  // --- Academic Levels ---
  const preescolar = await prisma.academicLevel.upsert({
    where: { id: ACADEMIC_LEVELS.preescolar },
    update: {},
    create: {
      id: ACADEMIC_LEVELS.preescolar,
      name: "Preescolar",
      description: "Educación preescolar (3 grados)",
      status: true,
    },
  });
  const primaria = await prisma.academicLevel.upsert({
    where: { id: ACADEMIC_LEVELS.primaria },
    update: {},
    create: {
      id: ACADEMIC_LEVELS.primaria,
      name: "Primaria",
      description: "Educación primaria básica (6 grados)",
      status: true,
    },
  });
  const secundaria = await prisma.academicLevel.upsert({
    where: { id: ACADEMIC_LEVELS.secundaria },
    update: {},
    create: {
      id: ACADEMIC_LEVELS.secundaria,
      name: "Secundaria",
      description: "Educación secundaria básica (3 grados)",
      status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
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
        status: true,
      },
    }),
  ]);
  console.log("  ✓ Scholarships: 4 records");

  // --- Payment Concepts ---
  await Promise.all([
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.inscripcion },
      update: {},
      create: {
        id: PAYMENT_CONCEPTS.inscripcion,
        name: "Inscripción",
        description: "Cuota de inscripción al ciclo escolar",
        baseAmount: 3500.0,
        allowRemission: true,
        status: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.colegiatura_mensual },
      update: {},
      create: {
        id: PAYMENT_CONCEPTS.colegiatura_mensual,
        name: "Colegiatura mensual",
        description: "Pago mensual de colegiatura",
        baseAmount: 4200.0,
        allowRemission: true,
        status: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.material_didactico },
      update: {},
      create: {
        id: PAYMENT_CONCEPTS.material_didactico,
        name: "Material didáctico",
        description: "Costo de materiales educativos del ciclo",
        baseAmount: 1800.0,
        allowRemission: false,
        status: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.uniforme_escolar },
      update: {},
      create: {
        id: PAYMENT_CONCEPTS.uniforme_escolar,
        name: "Uniforme escolar",
        description: "Paquete completo de uniforme escolar",
        baseAmount: 2500.0,
        allowRemission: false,
        status: true,
      },
    }),
    prisma.paymentConcept.upsert({
      where: { id: PAYMENT_CONCEPTS.seguro_escolar },
      update: {},
      create: {
        id: PAYMENT_CONCEPTS.seguro_escolar,
        name: "Seguro escolar",
        description: "Seguro de accidentes y gastos médicos escolares",
        baseAmount: 950.0,
        allowRemission: false,
        status: true,
      },
    }),
  ]);
  console.log("  ✓ Payment concepts: 5 records");

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

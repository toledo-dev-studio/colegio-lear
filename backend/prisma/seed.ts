import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool, { schema: "core" });
const prisma = new PrismaClient({ adapter });

// ─── Fixed UUIDs for deterministic seed data ────────────────────────────────────

const ACADEMIC_LEVELS = {
  preescolar: "a1000000-0000-4000-8000-000000000001",
  primaria: "a1000000-0000-4000-8000-000000000002",
  secundaria: "a1000000-0000-4000-8000-000000000003",
};

const EDUCATION_LEVELS = {
  primero_preescolar: "b2c3d4e5-2222-4000-8000-000000000001",
  segundo_preescolar: "b2c3d4e5-2222-4000-8000-000000000002",
  primero_primaria: "b2c3d4e5-2222-4000-8000-000000000003",
  segundo_primaria: "b2c3d4e5-2222-4000-8000-000000000004",
  primero_secundaria: "b2c3d4e5-2222-4000-8000-000000000005",
  segundo_secundaria: "b2c3d4e5-2222-4000-8000-000000000006",
};

const SCHOOL_SUBJECTS = {
  matematicas_1p: "c3d4e5f6-3333-4000-8000-000000000001",
  espanol_1p: "c3d4e5f6-3333-4000-8000-000000000002",
  ciencias_1p: "c3d4e5f6-3333-4000-8000-000000000003",
  matematicas_2p: "c3d4e5f6-3333-4000-8000-000000000004",
  matematicas_1s: "c3d4e5f6-3333-4000-8000-000000000005",
  historia_1s: "c3d4e5f6-3333-4000-8000-000000000006",
};

const SCHOLARSHIPS = {
  excelencia_academica: "d4e5f6a7-4444-4000-8000-000000000001",
  deportiva: "d4e5f6a7-4444-4000-8000-000000000002",
  hermanos: "d4e5f6a7-4444-4000-8000-000000000003",
  necesidad_economica: "d4e5f6a7-4444-4000-8000-000000000004",
};

const PAYMENT_CONCEPTS = {
  inscripcion: "a1b2c3d4-1111-4000-8000-000000000001",
  colegiatura_mensual: "a1b2c3d4-2222-4000-8000-000000000002",
  material_didactico: "a1b2c3d4-3333-4000-8000-000000000003",
  uniforme_escolar: "a1b2c3d4-4444-4000-8000-000000000004",
  seguro_escolar: "a1b2c3d4-5555-4000-8000-000000000005",
};

// ─── Seed function ──────────────────────────────────────────────────────────────

async function main() {
  console.log(
    "🌱 Seeding academic-levels, school-subjects, scholarships, and payment-concepts modules...",
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
  const primeroPreescolar = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.primero_preescolar },
    update: {},
    create: {
      id: EDUCATION_LEVELS.primero_preescolar,
      name: "1° Preescolar",
      description: "Primer grado de preescolar",
      academicLevelId: preescolar.id,
    },
  });

  const segundoPreescolar = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.segundo_preescolar },
    update: {},
    create: {
      id: EDUCATION_LEVELS.segundo_preescolar,
      name: "2° Preescolar",
      description: "Segundo grado de preescolar",
      academicLevelId: preescolar.id,
    },
  });

  const primeroPrimaria = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.primero_primaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.primero_primaria,
      name: "1° Primaria",
      description: "Primer grado de primaria",
      academicLevelId: primaria.id,
    },
  });

  const segundoPrimaria = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.segundo_primaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.segundo_primaria,
      name: "2° Primaria",
      description: "Segundo grado de primaria",
      academicLevelId: primaria.id,
    },
  });

  const primeroSecundaria = await prisma.educationLevel.upsert({
    where: { id: EDUCATION_LEVELS.primero_secundaria },
    update: {},
    create: {
      id: EDUCATION_LEVELS.primero_secundaria,
      name: "1° Secundaria",
      description: "Primer grado de secundaria",
      academicLevelId: secundaria.id,
    },
  });

  const segundoSecundaria = await prisma.educationLevel.upsert({
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
    `  ✓ Education levels: ${primeroPreescolar.name}, ${segundoPreescolar.name}, ${primeroPrimaria.name}, ${segundoPrimaria.name}, ${primeroSecundaria.name}, ${segundoSecundaria.name}`,
  );

  // --- School Subjects ---
  const subjects = await Promise.all([
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Matemáticas",
          educationLevelId: primeroPrimaria.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_1p,
        name: "Matemáticas",
        description: "Desarrollo del pensamiento lógico-matemático",
        status: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPrimaria.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Español",
          educationLevelId: primeroPrimaria.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.espanol_1p,
        name: "Español",
        description: "Lectura, escritura y comunicación oral",
        status: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPrimaria.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Ciencias Naturales",
          educationLevelId: primeroPrimaria.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.ciencias_1p,
        name: "Ciencias Naturales",
        description: "Exploración del mundo natural y sus fenómenos",
        status: true,
        academicLevelId: primaria.id,
        educationLevelId: primeroPrimaria.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Matemáticas",
          educationLevelId: segundoPrimaria.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_2p,
        name: "Matemáticas",
        description: "Aritmética, geometría y resolución de problemas",
        status: true,
        academicLevelId: primaria.id,
        educationLevelId: segundoPrimaria.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Matemáticas",
          educationLevelId: primeroSecundaria.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.matematicas_1s,
        name: "Matemáticas",
        description: "Álgebra, funciones y pensamiento abstracto",
        status: true,
        academicLevelId: secundaria.id,
        educationLevelId: primeroSecundaria.id,
      },
    }),
    prisma.schoolSubject.upsert({
      where: {
        name_educationLevelId: {
          name: "Historia",
          educationLevelId: primeroSecundaria.id,
        },
      },
      update: {},
      create: {
        id: SCHOOL_SUBJECTS.historia_1s,
        name: "Historia",
        description: "Historia de México y del mundo",
        status: true,
        academicLevelId: secundaria.id,
        educationLevelId: primeroSecundaria.id,
      },
    }),
  ]);

  console.log(`  ✓ School subjects: ${subjects.length} records`);

  // --- Scholarships ---
  const becaExcelencia = await prisma.scholarship.upsert({
    where: { id: SCHOLARSHIPS.excelencia_academica },
    update: {},
    create: {
      id: SCHOLARSHIPS.excelencia_academica,
      name: "Beca Excelencia Académica",
      description:
        "Beca otorgada a estudiantes con promedio sobresaliente durante el ciclo escolar",
      discountPercentage: 50,
      status: true,
    },
  });

  const becaDeportiva = await prisma.scholarship.upsert({
    where: { id: SCHOLARSHIPS.deportiva },
    update: {},
    create: {
      id: SCHOLARSHIPS.deportiva,
      name: "Beca Deportiva",
      description:
        "Beca para estudiantes que representan al colegio en competencias deportivas oficiales",
      discountPercentage: 30,
      status: true,
    },
  });

  const becaHermanos = await prisma.scholarship.upsert({
    where: { id: SCHOLARSHIPS.hermanos },
    update: {},
    create: {
      id: SCHOLARSHIPS.hermanos,
      name: "Beca Hermanos",
      description:
        "Descuento aplicable cuando dos o más hermanos están inscritos en el colegio",
      discountPercentage: 15,
      status: true,
    },
  });

  const becaNecesidad = await prisma.scholarship.upsert({
    where: { id: SCHOLARSHIPS.necesidad_economica },
    update: {},
    create: {
      id: SCHOLARSHIPS.necesidad_economica,
      name: "Beca Necesidad Económica",
      description:
        "Beca de apoyo para familias que demuestran necesidad económica comprobable",
      discountPercentage: 80,
      status: true,
    },
  });

  console.log(
    `  ✓ Scholarships: ${becaExcelencia.name}, ${becaDeportiva.name}, ${becaHermanos.name}, ${becaNecesidad.name}`,
  );

  // --- Payment Concepts ---
  const inscripcion = await prisma.paymentConcept.upsert({
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
  });

  const colegiaturaMensual = await prisma.paymentConcept.upsert({
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
  });

  const materialDidactico = await prisma.paymentConcept.upsert({
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
  });

  const uniformeEscolar = await prisma.paymentConcept.upsert({
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
  });

  const seguroEscolar = await prisma.paymentConcept.upsert({
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
  });

  console.log(
    `  ✓ Payment concepts: ${inscripcion.name}, ${colegiaturaMensual.name}, ${materialDidactico.name}, ${uniformeEscolar.name}, ${seguroEscolar.name}`,
  );

  // --- Admin Security Role ---
  const ADMIN_ROLE_ID = "d1000000-0000-4000-8000-000000000001";
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

  const adminRole = await prisma.securityRole.upsert({
    where: { id: ADMIN_ROLE_ID },
    update: {},
    create: {
      id: ADMIN_ROLE_ID,
      name: "Administrador",
      description: "Rol con acceso completo a todos los módulos del sistema",
      status: true,
    },
  });

  // Delete existing permissions and recreate (Sync_Completo)
  await prisma.securityRolePermission.deleteMany({
    where: { securityRoleId: adminRole.id },
  });
  await prisma.securityRolePermission.createMany({
    data: ALL_MODULE_KEYS.map((moduleKey) => ({
      securityRoleId: adminRole.id,
      moduleKey,
      canRead: true,
      canWrite: true,
      canDelete: true,
    })),
  });

  console.log(
    `  ✓ Admin role: ${adminRole.name} with ${ALL_MODULE_KEYS.length} permissions`,
  );

  // --- Admin Job Title ---
  const ADMIN_JOB_TITLE_ID = "e1000000-0000-0000-0000-000000000001";
  const adminJobTitle = await prisma.jobTitle.upsert({
    where: { id: ADMIN_JOB_TITLE_ID },
    update: {},
    create: {
      id: ADMIN_JOB_TITLE_ID,
      name: "Director General",
      description: "Dirección general del colegio",
      jobTitleType: "administrative_staff",
      status: true,
    },
  });

  // --- Admin Employees ---
  const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

  // Admin 1
  const admin1Name = process.env.ADMIN1_NAME || "Admin";
  const admin1LastName = process.env.ADMIN1_LAST_NAME || "One";
  const admin1Email = process.env.ADMIN1_EMAIL || "admin1@colegiolear.com";
  const admin1Password = process.env.ADMIN1_PASSWORD || "Admin123!";
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
      secondLastName: "Admin",
      phoneNumber: "0000000000",
      email: admin1Email,
      username: admin1Username,
      password: admin1HashedPassword,
      mustChangePassword: false,
      status: true,
      securityRoleId: adminRole.id,
      jobTitleId: adminJobTitle.id,
    },
  });

  // Admin 2
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
      secondLastName: "Admin",
      phoneNumber: "0000000000",
      email: admin2Email,
      username: admin2Username,
      password: admin2HashedPassword,
      mustChangePassword: false,
      status: true,
      securityRoleId: adminRole.id,
      jobTitleId: adminJobTitle.id,
    },
  });

  console.log(
    `  ✓ Admin employees: ${admin1Username} (${admin1Email}), ${admin2Username} (${admin2Email})`,
  );

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

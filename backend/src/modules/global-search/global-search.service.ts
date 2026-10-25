import { PrismaClient } from "../../generated/prisma/client";
import type { GlobalSearchGroup, GlobalSearchRecord } from "./global-search.types";

/** Permission entry shape attached to req.user by the authenticate middleware. */
interface PermissionEntry {
  moduleKey: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

const MAX_RESULTS_PER_MODULE = 3;

function truncate(value: string | null, maxLength = 80): string | undefined {
  if (!value) return undefined;
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

/**
 * Builds a GlobalSearchRecord, omitting `subtitle` entirely when undefined
 * (required by `exactOptionalPropertyTypes` — the field must be absent, not
 * present-with-value-undefined).
 */
function buildRecord(
  base: { id: string; label: string; route: string },
  subtitle: string | undefined,
): GlobalSearchRecord {
  return subtitle !== undefined ? { ...base, subtitle } : { ...base };
}

/** One entry per searchable module: how to query it and how to map a row to a record. */
interface SearchableModule {
  moduleKey: string;
  run: (prisma: PrismaClient, term: string) => Promise<GlobalSearchRecord[]>;
}

const SEARCHABLE_MODULES: SearchableModule[] = [
  {
    moduleKey: "students",
    run: async (prisma, term) => {
      const rows = await prisma.student.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { firstLastName: { contains: term, mode: "insensitive" } },
            { secondLastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { curp: { contains: term, mode: "insensitive" } },
            { enrollment: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, firstLastName: true, secondLastName: true, enrollment: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) => ({
        id: r.id,
        label: `${r.name} ${r.firstLastName} ${r.secondLastName}`,
        subtitle: r.enrollment,
        route: `/students/${r.id}`,
      }));
    },
  },
  {
    moduleKey: "employees",
    run: async (prisma, term) => {
      const rows = await prisma.employee.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { firstLastName: { contains: term, mode: "insensitive" } },
            { secondLastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, firstLastName: true, secondLastName: true, email: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) => ({
        id: r.id,
        label: [r.name, r.firstLastName, r.secondLastName].filter(Boolean).join(" "),
        subtitle: r.email,
        route: `/employees/${r.id}`,
      }));
    },
  },
  {
    moduleKey: "academic-cycles",
    run: async (prisma, term) => {
      const rows = await prisma.academicCycle.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { code: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) => ({
        id: r.id,
        label: r.name,
        subtitle: r.code,
        route: `/academic-cycles/${r.id}`,
      }));
    },
  },
  {
    moduleKey: "announcements",
    run: async (prisma, term) => {
      const rows = await prisma.announcement.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, description: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) =>
        buildRecord(
          { id: r.id, label: r.name, route: `/announcements/${r.id}` },
          truncate(r.description),
        ),
      );
    },
  },
  {
    moduleKey: "academic-levels",
    run: async (prisma, term) => {
      const rows = await prisma.academicLevel.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, description: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) =>
        buildRecord(
          { id: r.id, label: r.name, route: `/academic-levels/${r.id}` },
          truncate(r.description),
        ),
      );
    },
  },
  {
    moduleKey: "school-subjects",
    run: async (prisma, term) => {
      const rows = await prisma.schoolSubject.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, description: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) =>
        buildRecord(
          { id: r.id, label: r.name, route: `/school-subjects/${r.id}` },
          truncate(r.description),
        ),
      );
    },
  },
  {
    moduleKey: "scholarships",
    run: async (prisma, term) => {
      const rows = await prisma.scholarship.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, discountPercentage: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) => ({
        id: r.id,
        label: r.name,
        subtitle: `${Number(r.discountPercentage)}% de descuento`,
        route: `/scholarships/${r.id}`,
      }));
    },
  },
  {
    moduleKey: "payment-concepts",
    run: async (prisma, term) => {
      const rows = await prisma.paymentConcept.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { code: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) => ({
        id: r.id,
        label: r.name,
        subtitle: r.code,
        route: `/payment-concepts/${r.id}`,
      }));
    },
  },
  {
    moduleKey: "job-titles",
    run: async (prisma, term) => {
      const rows = await prisma.jobTitle.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, description: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) =>
        buildRecord(
          { id: r.id, label: r.name, route: `/job-titles/${r.id}` },
          truncate(r.description),
        ),
      );
    },
  },
  {
    moduleKey: "security-roles",
    run: async (prisma, term) => {
      const rows = await prisma.securityRole.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, description: true },
        orderBy: { name: "asc" },
        take: MAX_RESULTS_PER_MODULE,
      });
      return rows.map((r) =>
        buildRecord(
          { id: r.id, label: r.name, route: `/security-roles/${r.id}` },
          truncate(r.description),
        ),
      );
    },
  },
];

/**
 * Business logic layer for the Global Search feature.
 * Reuses each module's own search fields (same ones used by that module's
 * own `q` list filter) rather than a separate search index — this is a
 * simple ILIKE/contains search, not full-text/fuzzy search.
 */
export class GlobalSearchService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Searches every module the caller has canRead permission for, in
   * parallel, capped at 3 results each. Modules with zero matches (or
   * that the caller can't read) are omitted from the response entirely.
   */
  async search(
    term: string,
    permissions: PermissionEntry[],
  ): Promise<GlobalSearchGroup[]> {
    const allowedModules = SEARCHABLE_MODULES.filter((m) =>
      permissions.some((p) => p.moduleKey === m.moduleKey && p.canRead),
    );

    const groups = await Promise.all(
      allowedModules.map(async (m) => ({
        module: m.moduleKey,
        records: await m.run(this.prisma, term),
      })),
    );

    return groups.filter((g) => g.records.length > 0);
  }
}

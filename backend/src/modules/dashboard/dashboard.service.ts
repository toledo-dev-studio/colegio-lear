import { PrismaClient } from "../../generated/prisma/client";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type {
  AcademicCycleSummaryRecord,
  TopSchoolGroupRecord,
  FinancialSummaryRecord,
  AnnouncementSummaryRecord,
  SystemSummaryRecord,
  TeacherEmployeeSummaryRecord,
} from "./dashboard.types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Business logic layer for the Dashboard module.
 * Every method here is a read-only aggregate query — there is no CRUD.
 */
export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Top 3 active-cycle school groups (status="active", in a cycle with
   * status="active") ranked by average grade across all recorded
   * StudentGrade entries for their enrolled students. Groups with no
   * recorded grades yet are excluded (nothing to rank).
   */
  private async getTopGroups(): Promise<TopSchoolGroupRecord[]> {
    const groups = await this.prisma.academicCycleGroup.findMany({
      where: { status: "active", academicCycle: { status: "active" } },
      select: {
        id: true,
        name: true,
        academicCycle: { select: { name: true } },
        _count: { select: { enrollments: { where: { status: "enrolled" } } } },
      },
    });

    if (groups.length === 0) return [];

    const groupIds = groups.map((g) => g.id);

    const grades = await this.prisma.studentGrade.findMany({
      where: {
        academicCycleEnrollment: {
          academicCycleSchoolGroupId: { in: groupIds },
        },
      },
      select: {
        grade: true,
        academicCycleEnrollment: {
          select: { academicCycleSchoolGroupId: true },
        },
      },
    });

    const gradeStats = new Map<string, { sum: number; count: number }>();
    for (const g of grades) {
      const groupId = g.academicCycleEnrollment.academicCycleSchoolGroupId;
      const stat = gradeStats.get(groupId) ?? { sum: 0, count: 0 };
      stat.sum += Number(g.grade);
      stat.count += 1;
      gradeStats.set(groupId, stat);
    }

    return groups
      .map((g) => {
        const stat = gradeStats.get(g.id);
        if (!stat) return null;
        return {
          id: g.id,
          name: g.name,
          academicCycleName: g.academicCycle.name,
          averageGrade: round2(stat.sum / stat.count),
          studentsCount: g._count.enrollments,
        };
      })
      .filter((g): g is TopSchoolGroupRecord => g !== null)
      .sort((a, b) => b.averageGrade - a.averageGrade)
      .slice(0, 3);
  }

  /**
   * Academic cycles / students summary. If there are no active academic
   * cycles, everything else is left at zero/empty — there's nothing to
   * aggregate, and it skips the heavier queries entirely.
   */
  async getAcademicCyclesSummary(): Promise<AcademicCycleSummaryRecord> {
    const activeAcademicCyclesCount = await this.prisma.academicCycle.count({
      where: { status: "active" },
    });

    if (activeAcademicCyclesCount === 0) {
      return {
        activeAcademicCyclesCount: 0,
        activeStudentsCount: 0,
        droppedStudentsCount: 0,
        topGroups: [],
      };
    }

    const [activeStudentsCount, droppedStudentsCount, topGroups] =
      await Promise.all([
        this.prisma.academicCycleEnrollment.count({
          where: { status: "enrolled", academicCycle: { status: "active" } },
        }),
        this.prisma.academicCycleEnrollment.count({
          where: { status: "dropped", academicCycle: { status: "active" } },
        }),
        this.getTopGroups(),
      ]);

    return {
      activeAcademicCyclesCount,
      activeStudentsCount,
      droppedStudentsCount,
      topGroups,
    };
  }

  /**
   * Financial (student wallet) summary, scoped to active academic cycles
   * only. All zero when there are no active cycles — skips the aggregate
   * queries entirely in that case.
   *
   * totalPaidAmount/totalForgivenAmount come from StudentWalletPayment
   * (the real payment-history rows, one per actual charge or
   * forgiveness) — not from StudentWalletItem, which only reflects the
   * item's current state. pendingAmount/forgivenPaymentsCount instead
   * come from StudentWalletItem (outstandingAmount and isForgiven are
   * item-level state, not events).
   */
  async getFinancialSummary(): Promise<FinancialSummaryRecord> {
    const activeAcademicCyclesCount = await this.prisma.academicCycle.count({
      where: { status: "active" },
    });

    if (activeAcademicCyclesCount === 0) {
      return {
        totalPaidAmount: 0,
        pendingAmount: 0,
        forgivenPaymentsCount: 0,
        totalForgivenAmount: 0,
      };
    }

    const cycleFilter = { academicCycle: { status: "active" as const } };

    const [paidPayments, forgivenPayments, pendingItems, forgivenItemsCount] =
      await Promise.all([
        this.prisma.studentWalletPayment.aggregate({
          where: { ...cycleFilter, paymentMethod: { not: "forgiven" } },
          _sum: { amount: true },
        }),
        this.prisma.studentWalletPayment.aggregate({
          where: { ...cycleFilter, paymentMethod: "forgiven" },
          _sum: { amount: true },
        }),
        this.prisma.studentWalletItem.aggregate({
          where: { ...cycleFilter, isForgiven: false },
          _sum: { outstandingAmount: true },
        }),
        this.prisma.studentWalletItem.count({
          where: { ...cycleFilter, isForgiven: true },
        }),
      ]);

    return {
      totalPaidAmount: round2(Number(paidPayments._sum.amount ?? 0)),
      pendingAmount: round2(Number(pendingItems._sum.outstandingAmount ?? 0)),
      forgivenPaymentsCount: forgivenItemsCount,
      totalForgivenAmount: round2(Number(forgivenPayments._sum.amount ?? 0)),
    };
  }

  /**
   * Announcements ("campaigns") summary. viewedPercentage is derived from
   * recipientsCount/viewedCount — calculated fields a future cron job
   * maintains, not computed live from per-recipient records here.
   */
  async getAnnouncementsSummary(): Promise<AnnouncementSummaryRecord> {
    const now = new Date();
    const activeFilter = {
      status: "in_progress" as never,
      isDeleted: false,
      publishedAt: { lte: now },
      expiresAt: { gte: now },
    };

    const [activeAnnouncementsCount, aggregate] = await Promise.all([
      this.prisma.announcement.count({ where: activeFilter }),
      this.prisma.announcement.aggregate({
        where: activeFilter,
        _sum: { recipientsCount: true, viewedCount: true },
      }),
    ]);

    const totalRecipients = aggregate._sum.recipientsCount ?? 0;
    const totalViewed = aggregate._sum.viewedCount ?? 0;
    const viewedPercentage =
      totalRecipients > 0
        ? Math.round((totalViewed / totalRecipients) * 1000) / 10
        : 0;

    return { activeAnnouncementsCount, viewedPercentage };
  }

  /** System-wide registration counts (roles, job titles, employees by type). */
  async getSystemSummary(): Promise<SystemSummaryRecord> {
    const [
      securityRolesCount,
      jobTitlesCount,
      teachersEmployeesCount,
      administrativeEmployeesCount,
    ] = await Promise.all([
      this.prisma.securityRole.count({ where: { isDeleted: false } }),
      this.prisma.jobTitle.count({ where: { isDeleted: false } }),
      this.prisma.employee.count({
        where: { isDeleted: false, jobTitle: { jobTitleType: "teacher" } },
      }),
      this.prisma.employee.count({
        where: {
          isDeleted: false,
          jobTitle: { jobTitleType: "administrative_staff" },
        },
      }),
    ]);

    return {
      securityRolesCount,
      jobTitlesCount,
      teachersEmployeesCount,
      administrativeEmployeesCount,
    };
  }

  /** Up to 10 most recently registered teacher-type employees. */
  async getLatestTeachers(): Promise<TeacherEmployeeSummaryRecord[]> {
    const employees = await this.prisma.employee.findMany({
      where: { isDeleted: false, jobTitle: { jobTitleType: "teacher" } },
      select: {
        id: true,
        name: true,
        firstLastName: true,
        secondLastName: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return employees.map((e) => ({
      id: e.id,
      fullName: [e.name, e.firstLastName, e.secondLastName]
        .filter(Boolean)
        .join(" "),
      email: e.email,
      createdAt: e.createdAt.toISOString(),
      avatar: toPublicFileUrl(e.avatar),
    }));
  }
}

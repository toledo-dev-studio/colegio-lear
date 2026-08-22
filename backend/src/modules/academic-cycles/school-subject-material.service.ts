import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type { IStorageService } from "../../shared/services/storage.service";
import type {
  SchoolSubjectMaterialRecord,
  SchoolSubjectMaterialFlatRecord,
  FileUpload,
} from "./school-subject-material.types";

/**
 * Business logic for the school-subject materials sub-resource. Shared by
 * both the employee CRUD controller and the student-portal read-only
 * controller (see school-subject-material-student.controller.ts) — the
 * student side only ever calls findAll, with its own ownership check
 * layered on top.
 */
export class SchoolSubjectMaterialService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: IStorageService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toRecord(raw: any): SchoolSubjectMaterialRecord {
    return {
      id: raw.id,
      academicCycleId: raw.academicCycleId,
      academicCycleSchoolGroupId: raw.academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId: raw.academicCycleSchoolSubjectId,
      attachment: {
        id: raw.id,
        url: toPublicFileUrl(raw.attachmentUrl),
        name: raw.attachmentName,
        extension: raw.attachmentExtension,
        relatedRecordId: raw.id,
      },
    };
  }

  /**
   * Teacher-facing ("my classes") mapping — flat, keyed by the plain
   * schoolSubjectId the caller already resolved from the URL (no extra
   * query needed, unlike academicCycleSchoolSubjectId which lives on the row).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toFlatRecord(raw: any, schoolSubjectId: string): SchoolSubjectMaterialFlatRecord {
    return {
      id: raw.id,
      url: toPublicFileUrl(raw.attachmentUrl),
      name: raw.attachmentName,
      extension: raw.attachmentExtension,
      relatedRecordId: raw.id,
      academicCycleSchoolGroupId: raw.academicCycleSchoolGroupId,
      schoolSubjectId,
    };
  }

  /** Verifies the group and subject both actually belong to the given academic cycle. */
  async ensureScopeExists(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
  ): Promise<void> {
    const [group, subject] = await Promise.all([
      this.prisma.academicCycleGroup.findFirst({
        where: { id: academicCycleSchoolGroupId, academicCycleId },
      }),
      this.prisma.academicCycleSchoolSubject.findFirst({
        where: { id: academicCycleSchoolSubjectId, academicCycleId },
      }),
    ]);

    if (!group) {
      throw new NotFoundError(
        "Academic cycle school group not found in this academic cycle",
      );
    }
    if (!subject) {
      throw new NotFoundError(
        "Academic cycle school subject not found in this academic cycle",
      );
    }
  }

  async findAll(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
  ): Promise<SchoolSubjectMaterialRecord[]> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const results = await this.prisma.schoolSubjectMaterial.findMany({
      where: {
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId,
      },
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toRecord(r));
  }

  /** Uploads the file and creates the material row; returns the raw created row. */
  private async uploadMaterial(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    file: FileUpload,
  ) {
    const attachmentUrl = await this.storage.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subfolder: "school-subject-materials",
    });

    const nameParts = file.originalname.split(".");
    const attachmentExtension = nameParts.length > 1 ? nameParts.pop()! : "";
    const attachmentName = nameParts.join(".");

    return this.prisma.schoolSubjectMaterial.create({
      data: {
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId,
        attachmentUrl,
        attachmentName,
        attachmentExtension,
      },
    });
  }

  /** Employee/student-facing: creates the material and its single attachment in one call. */
  async create(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    file: FileUpload,
  ): Promise<SchoolSubjectMaterialRecord> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const created = await this.uploadMaterial(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      file,
    );

    return this.toRecord(created);
  }

  /** Teacher-facing ("my classes"): full (non-paginated) list, flat shape. */
  async findAllFlat(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    schoolSubjectId: string,
  ): Promise<SchoolSubjectMaterialFlatRecord[]> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const results = await this.prisma.schoolSubjectMaterial.findMany({
      where: { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId },
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toFlatRecord(r, schoolSubjectId));
  }

  /** Teacher-facing ("my classes"): creates the material, flat shape. */
  async createFlat(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    schoolSubjectId: string,
    file: FileUpload,
  ): Promise<SchoolSubjectMaterialFlatRecord> {
    await this.ensureScopeExists(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
    );

    const created = await this.uploadMaterial(
      academicCycleId,
      academicCycleSchoolGroupId,
      academicCycleSchoolSubjectId,
      file,
    );

    return this.toFlatRecord(created, schoolSubjectId);
  }

  async remove(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    academicCycleSchoolSubjectId: string,
    materialId: string,
  ): Promise<void> {
    const material = await this.prisma.schoolSubjectMaterial.findFirst({
      where: {
        id: materialId,
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId,
      },
    });
    if (!material) throw new NotFoundError("School subject material not found");

    await this.storage.delete(material.attachmentUrl);
    await this.prisma.schoolSubjectMaterial.delete({ where: { id: materialId } });
  }
}

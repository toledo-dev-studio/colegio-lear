import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type { IStorageService } from "../../shared/services/storage.service";
import type {
  SchoolSubjectMaterialRecord,
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

  /** Creates the material and its single attachment in one call. */
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

    const attachmentUrl = await this.storage.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subfolder: "school-subject-materials",
    });

    const nameParts = file.originalname.split(".");
    const attachmentExtension = nameParts.length > 1 ? nameParts.pop()! : "";
    const attachmentName = nameParts.join(".");

    const created = await this.prisma.schoolSubjectMaterial.create({
      data: {
        academicCycleId,
        academicCycleSchoolGroupId,
        academicCycleSchoolSubjectId,
        attachmentUrl,
        attachmentName,
        attachmentExtension,
      },
    });

    return this.toRecord(created);
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

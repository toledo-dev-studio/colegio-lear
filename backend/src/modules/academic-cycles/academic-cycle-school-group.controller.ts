import { Request, Response } from "express";
import { AcademicCycleSchoolGroupService } from "./academic-cycle-school-group.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";

const service = new AcademicCycleSchoolGroupService(prisma);

/** GET /academic-cycles/:academicCycleId/school-groups */
export async function findAllSchoolGroups(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.findAll(academicCycleId);
  sendSuccess(res, data);
}

/** GET /academic-cycles/:academicCycleId/school-groups/:id */
export async function findSchoolGroupById(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  const data = await service.findById(academicCycleId, id);
  sendSuccess(res, data);
}

/** POST /academic-cycles/:academicCycleId/school-groups */
export async function createSchoolGroup(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.create(academicCycleId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /academic-cycles/:academicCycleId/school-groups/:id */
export async function updateSchoolGroup(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  const data = await service.update(academicCycleId, id, req.body);
  sendSuccess(res, data);
}

/** DELETE /academic-cycles/:academicCycleId/school-groups/:id */
export async function deleteSchoolGroup(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  await service.remove(academicCycleId, id);
  sendNoContent(res);
}

/** GET /academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/calendars */
export async function findAllCalendars(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId } = req.params as {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
  };
  const data = await service.findAllCalendars(
    academicCycleId,
    academicCycleSchoolGroupId,
  );
  sendSuccess(res, data);
}

/** GET /academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/teachers */
export async function findAllTeachers(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId } = req.params as {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
  };
  const includeInactive = req.query.includeInactive === "true";
  const data = await service.findAllTeachers(
    academicCycleId,
    academicCycleSchoolGroupId,
    includeInactive,
  );
  sendSuccess(res, data);
}

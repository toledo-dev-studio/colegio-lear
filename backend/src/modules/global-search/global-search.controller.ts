import { Request, Response } from "express";
import { GlobalSearchService } from "./global-search.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess } from "../../shared/helpers/response.helper";

const service = new GlobalSearchService(prisma);

/** GET /global-search?q=term */
export async function search(req: Request, res: Response): Promise<void> {
  const { q } = req.query as { q: string };
  const { permissions } = req.user!;

  const data = await service.search(q, permissions);

  sendSuccess(res, data);
}

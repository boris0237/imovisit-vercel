import { NextRequest } from "next/server";
import { prisma } from "@/services/db";
import { apiResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/biens/{id}/view:
 *   post:
 *     tags:
 *       - Biens
 *     summary: Incrémenter les vues d’un bien
 *     description: Incrémente le compteur de vues d’un bien (public).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vue incrémentée
 *       404:
 *         description: Bien non trouvé
 *       500:
 *         description: Erreur serveur
 */

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return apiResponse({ status: 404, message: "Bien non trouvé" });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { id: true, views: true },
    });

    return apiResponse({ status: 200, message: "Vue incrémentée", data: updated });
  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message || "Erreur lors de l'incrément" });
  }
}

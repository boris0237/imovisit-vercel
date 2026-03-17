import { NextRequest } from "next/server";
import { prisma } from "@/services/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

/**
 * @swagger
 * /api/biens/{id}/favorite:
 *   get:
 *     tags:
 *       - Biens
 *     summary: Vérifier si un bien est en favori
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut favori
 *   post:
 *     tags:
 *       - Biens
 *     summary: Ajouter/retirer un favori
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut favori mis à jour
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;
    const favorite = await prisma.favorite.findFirst({
      where: { propertyId: params.id, userId: user.id },
    });

    return apiResponse({
      status: 200,
      message: "Statut favori",
      data: { isFavorite: !!favorite },
    });
  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message || "Erreur serveur" });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;
    const existing = await prisma.favorite.findFirst({
      where: { propertyId: params.id, userId: user.id },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return apiResponse({
        status: 200,
        message: "Favori retiré",
        data: { isFavorite: false },
      });
    }

    await prisma.favorite.create({
      data: { propertyId: params.id, userId: user.id },
    });

    return apiResponse({
      status: 200,
      message: "Favori ajouté",
      data: { isFavorite: true },
    });
  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message || "Erreur serveur" });
  }
}

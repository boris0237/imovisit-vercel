import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

/**
 * @swagger
 * /api/districts/{id}:
 *   get:
 *     tags:
 *       - Geolocalisation
 *     summary: Détail d’un quartier
 *     description: Récupère un quartier par son ID avec sa ville et le pays associé.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65fa12ab34cd56ef78901234
 *     responses:
 *       200:
 *         description: Quartier trouvé
 *       404:
 *         description: Quartier introuvable
 *       500:
 *         description: Erreur serveur
 */

// GET ONE
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const district = await prisma.district.findUnique({
      where: { id: params.id },
      include: {
        city: {
          include: {
            country: true
          }
        }
      }
    });

    if (!district) {
      return apiResponse({ status: 404, message: "Quartier introuvable" });
    }

    return apiResponse({ status: 200, data: district });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/districts/{id}:
 *   patch:
 *     tags:
 *       - Geolocalisation
 *     summary: Modifier un quartier
 *     description: Permet de modifier les informations d’un quartier existant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bonapriso
 *               cityId:
 *                 type: string
 *                 example: 65fa12ab34cd56ef78901234
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Quartier mis à jour
 *       400:
 *         description: Quartier déjà existant pour cette ville
 *       404:
 *         description: Quartier introuvable
 *       500:
 *         description: Erreur serveur
 */

// UPDATE
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { name, cityId, isActive } = body;

    const district = await prisma.district.findUnique({
      where: { id: params.id }
    });

    if (!district) {
      return apiResponse({ status: 404, message: "Quartier introuvable" });
    }

    // Vérifier doublon si changement
    if (name && cityId) {
      const existing = await prisma.district.findFirst({
        where: {
          name,
          cityId,
          NOT: { id: params.id }
        }
      });

      if (existing) {
        return apiResponse({
          status: 400,
          message: "Quartier déjà existant pour cette ville"
        });
      }
    }

    const updated = await prisma.district.update({
      where: { id: params.id },
      data: { name, cityId, isActive }
    });

    return apiResponse({
      status: 200,
      message: "Quartier mis à jour",
      data: updated
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/districts/{id}:
 *   delete:
 *     tags:
 *       - Geolocalisation
 *     summary: Supprimer un quartier
 *     description: Supprime définitivement un quartier du système.
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
 *         description: Quartier supprimé avec succès
 *       404:
 *         description: Quartier introuvable
 *       500:
 *         description: Erreur serveur
 */

// DELETE PHYSIQUE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const district = await prisma.district.findUnique({
      where: { id: params.id }
    });

    if (!district) {
      return apiResponse({ status: 404, message: "Quartier introuvable" });
    }


    await prisma.district.delete({
      where: { id: params.id }
    });

    return apiResponse({
      status: 200,
      message: "Quartier supprimé avec succès"
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
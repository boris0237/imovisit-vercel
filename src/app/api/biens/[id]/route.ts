// src/app/api/biens/[id]/route.ts

import { NextRequest } from "next/server";
import { prisma } from "@/services/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handlePropertyFormData } from "@/utils/handle-property-formData";
import { USER_ROLE_ENUM } from "@/types/enums";


// -- Voir un Bien --

/**
 * @swagger
 * /api/biens/{id}:
 *   get:
 *     tags:
 *       - Biens
 *     summary: Récupérer le détail d’un bien
 *     description: Retourne les informations complètes d’un bien via son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f9e3f47b1a5c8f23456789
 *     responses:
 *       200:
 *         description: Détail du bien récupéré
 *       404:
 *         description: Bien non trouvé
 *       500:
 *         description: Erreur serveur
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const property = await prisma.property.findUnique({
            where: { id },
        });

        if (!property) {
            return apiResponse({ status: 404, message: "Bien non trouvé" });
        }

        return apiResponse({ status: 200, message: "Détail du bien", data: property });
    } catch (err: any) {
        return apiResponse({ status: 500, message: err.message || "Erreur lors de la récupération du bien" });
    }
}



// -- Mettre à jour un Bien --

/**
 * @swagger
 * /api/biens/{id}:
 *   patch:
 *     tags:
 *       - Biens
 *     summary: Modifier un bien
 *     description: Permet au propriétaire du bien ou à un admin de modifier un bien existant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               city:
 *                 type: string
 *               rooms:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bien mis à jour
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Bien non trouvé
 *       500:
 *         description: Erreur serveur
 */

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const user = (req as any).user;
        const formData = await req.formData();
        const data = await handlePropertyFormData(formData);

        const property = await prisma.property.findUnique({ where: { id: params.id } });
        if (!property) return apiResponse({ status: 404, message: "Bien non trouvé" });

        // Seul le créateur ou admin peut modifier
        if (property.userId !== user.id && user.role !== USER_ROLE_ENUM.admin) {
            return apiResponse({ status: 403, message: "Non autorisé à modifier ce bien" });
        }

        const updatedProperty = await prisma.property.update({
            where: { id: params.id },
            data,
        });

        return apiResponse({ status: 200, message: "Bien mis à jour", data: updatedProperty });
    } catch (err: any) {
        return apiResponse({ status: 500, message: err.message || "Erreur lors de la mise à jour" });
    }
}

// -- Supprimer un Bien --
/**
 * @swagger
 * /api/biens/{id}:
 *   delete:
 *     tags:
 *       - Biens
 *     summary: Supprimer un bien
 *     description: Permet au propriétaire du bien ou à un admin de supprimer définitivement un bien.
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
 *         description: Bien supprimé
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Bien non trouvé
 *       500:
 *         description: Erreur serveur
 */

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;
    const property = await prisma.property.findUnique({ where: { id: params.id } });
    if (!property) return apiResponse({ status: 404, message: "Bien non trouvé" });

    // Seul le créateur ou admin peut supprimer
    if (property.userId !== user.id && user.role !== USER_ROLE_ENUM.admin) {
      return apiResponse({ status: 403, message: "Non autorisé à supprimer ce bien" });
    }

    const deletedProperty = await prisma.property.delete({
      where: { id: params.id },
    });

    return apiResponse({ status: 200, message: "Bien supprimé définitivement", data: deletedProperty });
  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message || "Erreur lors de la suppression" });
  }
}

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";


/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     tags:
 *       - Geolocalisation
 *     summary: Détail d’une ville
 *     description: Récupère une ville par son ID avec ses quartiers.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65fa12ab34cd56ef78901234
 *     responses:
 *       200:
 *         description: Ville trouvée
 *       404:
 *         description: Ville introuvable
 *       500:
 *         description: Erreur serveur
 */

// Détail ville
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const city = await prisma.city.findUnique({
            where: { id: params.id },
            include: { districts: true } // inclure les quartiers
        });

        if (!city) {
            return apiResponse({ status: 404, message: "Ville introuvable" });
        }

        return apiResponse({ status: 200, data: city });
    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}

/**
 * @swagger
 * /api/cities/{id}:
 *   patch:
 *     tags:
 *       - Geolocalisation
 *     summary: Modifier une ville
 *     description: Permet de modifier les informations d’une ville.
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
 *                 example: Douala
 *               countryId:
 *                 type: string
 *                 example: 65fa12ab34cd56ef78901234
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Ville mise à jour
 *       400:
 *         description: Ville déjà existante pour ce pays
 *       404:
 *         description: Ville introuvable
 *       500:
 *         description: Erreur serveur
 */

// Mettre à jour une ville
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const body = await req.json();
        const { name, countryId, isActive } = body;

        const city = await prisma.city.findUnique({ where: { id: params.id } });
        if (!city) return apiResponse({ status: 404, message: "Ville introuvable" });

        //Vérifier doublon
        if (name && countryId) {
            const existing = await prisma.city.findFirst({
                where: {
                    name,
                    countryId,
                    NOT: { id: params.id }
                }
            });
            if (existing) return apiResponse({ status: 400, message: "Ville déjà existante pour ce pays" });
        }

        const updatedCity = await prisma.city.update({
            where: { id: params.id },
            data: { name, countryId, isActive }
        });

        return apiResponse({ status: 200, message: "Ville mise à jour", data: updatedCity });

    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     tags:
 *       - Geolocalisation
 *     summary: Supprimer une ville
 *     description: Supprime définitivement une ville du système.
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
 *         description: Ville supprimée avec succès
 *       404:
 *         description: Ville introuvable
 *       500:
 *         description: Erreur serveur
 */

// Supprimer une ville
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        //Vérifier si la ville existe
        const city = await prisma.city.findUnique({ where: { id: params.id } });
        if (!city) {
            return apiResponse({ status: 404, message: "Ville introuvable" });
        }

        //Suppression physique
        await prisma.city.delete({ where: { id: params.id } });

        return apiResponse({ status: 200, message: "Ville supprimée avec succès" });

    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}
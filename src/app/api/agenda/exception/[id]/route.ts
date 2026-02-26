/**
 * @swagger
 * /api/agenda/exception/{id}:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer une exception par ID
 *     description: Permet de récupérer une exception de disponibilité spécifique (congé ou indisponibilité ponctuelle).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'exception
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exception récupérée avec succès
 *       404:
 *         description: Exception non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   patch:
 *     tags:
 *       - Agenda
 *     summary: Modifier une exception
 *     description: Permet de modifier une exception de disponibilité existante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'exception
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               dayOfMonth:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 example: "14:00"
 *               endTime:
 *                 type: string
 *                 example: "18:00"
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exception mise à jour avec succès
 *       404:
 *         description: Exception non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   delete:
 *     tags:
 *       - Agenda
 *     summary: Supprimer une exception
 *     description: Permet de supprimer une exception de disponibilité.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'exception
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exception supprimée avec succès
 *       404:
 *         description: Exception non trouvée
 *       500:
 *         description: Erreur serveur
 */

import { NextRequest } from "next/server";
import { prisma } from "@/services/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

interface Params {
    params: { id: string };
}

// GET ONE
export async function GET(req: NextRequest, { params }: Params) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const exception = await prisma.availabilityException.findUnique({
            where: { id: params.id }
        });

        if (!exception) {
            return apiResponse({ status: 404, message: "Exception non trouvée" });
        }

        return apiResponse({ status: 200, message: "Exception récupérée", data: exception });

    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}

// UPDATE
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const body = await req.json();

        const updated = await prisma.availabilityException.update({
            where: { id: params.id },
            data: {
                ...body,
                date: body.date ? new Date(body.date) : undefined
            }
        });

        return apiResponse({ status: 200, message: "Exception mise à jour", data: updated });

    } catch (error: any) {
        console.log(error.message);
        return apiResponse({ status: 500, message: error.message });
    }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        await prisma.availabilityException.delete({
            where: { id: params.id }
        });

        return apiResponse({status:200, message:"Exception supprimée"});

    } catch (error:any) {
          return apiResponse({ status: 500, message: error.message });
    }
}
/**
 * @swagger
 * /api/agenda/reservation/{id}:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer une réservation
 *     description: Permet de récupérer une réservation précise par son ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation récupérée avec succès
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   patch:
 *     tags:
 *       - Agenda
 *     summary: Mettre à jour une réservation
 *     description: Permet de modifier une réservation. Vérifie les chevauchements avec autres réservations et exceptions.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 example: "13:30"
 *               endTime:
 *                 type: string
 *                 example: "14:30"
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Réservation mise à jour avec succès
 *       400:
 *         description: Créneau déjà réservé ou invalide
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   delete:
 *     tags:
 *       - Agenda
 *     summary: Supprimer une réservation
 *     description: Permet de supprimer une réservation par son ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation à supprimer
 *     responses:
 *       200:
 *         description: Réservation supprimée avec succès
 *       404:
 *         description: Réservation introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */


import { prisma } from "@/service/db";
import { NextRequest } from "next/server";
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

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id }
    });

    if (!reservation) {
      return apiResponse({ status: 404, message: "Réservation introuvable" });
    }

    return apiResponse({
      status: 200,
      message: "Réservation récupérée",
      data: reservation
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}

// PATCH
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();

    const updated = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined
      }
    });

    return apiResponse({
      status: 200,
      message: "Réservation mise à jour",
      data: updated
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    await prisma.reservation.delete({
      where: { id: params.id }
    });

    return apiResponse({
      status: 200,
      message: "Réservation supprimée"
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}
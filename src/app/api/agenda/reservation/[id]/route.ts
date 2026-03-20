/**
 * @swagger
 * /api/agenda/reservation/{id}:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer une réservation
 *     description: Récupère une réservation précise par son ID.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 propertyId:
 *                   type: string
 *                 ownerId:
 *                   type: string
 *                 clientId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 startTime:
 *                   type: string
 *                 endTime:
 *                   type: string
 *                 visitType:
 *                   type: string
 *                   enum: [in_person, remote]
 *                 visitContext:
 *                   type: string
 *                   nullable: true
 *                 status:
 *                   type: string
 *                   enum: [pending, confirmed, cancelled]
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur interne du serveur
 *
 *   patch:
 *     tags:
 *       - Agenda
 *     summary: Mettre à jour une réservation
 *     description: >
 *       Modifie une réservation existante. Les champs non fournis conservent leur valeur actuelle.
 *       Vérifie les exceptions de disponibilité (400) et les conflits avec d'autres réservations (409) avant d'appliquer la modification.
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
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-15"
 *                 description: Nouvelle date (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 example: "13:30"
 *                 description: Nouvelle heure de début (HH:MM)
 *               endTime:
 *                 type: string
 *                 example: "14:30"
 *                 description: Nouvelle heure de fin (HH:MM)
 *               visitType:
 *                 type: string
 *                 enum: [in_person, remote]
 *                 description: Type de visite
 *               visitContext:
 *                 type: string
 *                 nullable: true
 *                 description: Contexte de la visite
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 description: Statut de la réservation
 *     responses:
 *       200:
 *         description: Réservation mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 propertyId:
 *                   type: string
 *                 ownerId:
 *                   type: string
 *                 clientId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 startTime:
 *                   type: string
 *                 endTime:
 *                   type: string
 *                 visitType:
 *                   type: string
 *                   enum: [in_person, remote]
 *                 visitContext:
 *                   type: string
 *                   nullable: true
 *                 status:
 *                   type: string
 *                   enum: [pending, confirmed, cancelled]
 *       400:
 *         description: Plage horaire non disponible (exception de disponibilité)
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Réservation introuvable
 *       409:
 *         description: Conflit — cette plage horaire est déjà réservée
 *       500:
 *         description: Erreur interne du serveur
 *
 *   delete:
 *     tags:
 *       - Agenda
 *     summary: Supprimer une réservation
 *     description: Supprime définitivement une réservation par son ID.
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
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */


import { prisma } from "@/services/db";
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


// Mofidier une reservation
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { date, startTime, endTime, ...rest } = body;

    const existing = await prisma.reservation.findUnique({
      where: { id: params.id }
    });
    if (!existing)
      return apiResponse({ status: 404, message: "Réservation introuvable" });

    // Fusionner les nouvelles valeurs avec les anciennes (si non fournies)
    const newDate = date ? new Date(date) : existing.date;
    const newStart = startTime ?? existing.startTime;
    const newEnd = endTime ?? existing.endTime;

    const timeFilter = {
      AND: [{ startTime: { lt: newEnd } }, { endTime: { gt: newStart } }]
    };

    // Vérifier les exceptions de disponibilité
    const exception = await prisma.availabilityException.findFirst({
      where: {
        ownerId: existing.ownerId,
        OR: [
          { date: newDate, ...timeFilter },
          { dateStart: { lte: newDate }, dateEnd: { gte: newDate } }
        ]
      }
    });
    if (exception)
      return apiResponse({ status: 400, message: "Plage horaire non disponible" });

    // Vérifier les conflits avec d'autres réservation
    const conflict = await prisma.reservation.findFirst({
      where: {
        id: { not: params.id },
        propertyId: existing.propertyId,
        date: newDate,
        status: { in: ["pending", "confirmed"] },
        ...timeFilter
      }
    });
    if (conflict)
      return apiResponse({ status: 409, message: "Cette plage horaire est déjà réservée" });

    const updated = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...rest,
        date: newDate,
        startTime: newStart,
        endTime: newEnd
      }
    });

    return apiResponse({ status: 200, message: "Réservation mise à jour", data: updated });

  } catch (err: any) {
    console.error("[PATCH /reservation]", err);
    return apiResponse({ status: 500, message: "Erreur interne du serveur" });
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
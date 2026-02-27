/**
 * @swagger
 * /api/agenda/reservation:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une réservation
 *     description: Crée une réservation pour un bien en vérifiant les chevauchements avec d'autres réservations et les exceptions.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID du bien
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date de réservation (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 example: "13:30"
 *                 description: Heure de début
 *               endTime:
 *                 type: string
 *                 example: "14:30"
 *                 description: Heure de fin
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Créneau déjà réservé ou champs manquants
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Bien introuvable
 *       500:
 *         description: Erreur serveur
 *
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer la liste des réservations
 *     description: Permet de récupérer les réservations avec filtres dynamiques (bien, propriétaire, client, statut, date, horaire).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filtrer par ID du bien
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filtrer par ID du propriétaire
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filtrer par ID du client
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Filtrer par statut
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par date exacte
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *         description: Filtrer par heure de début
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *         description: Filtrer par heure de fin
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des réservations récupérée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */


import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

// creation reservation
export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { propertyId, date, startTime, endTime } = body;

    if (!propertyId || !date || !startTime || !endTime) {
      return apiResponse({ status: 400, message: "Champs obligatoires manquants" });
    }

    const decodedUser = (req as any).user;
    const reservationDate = new Date(date);
    const dayOfWeek = reservationDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const dayOfMonth = reservationDate.getDate();

    // Vérifier chevauchement avec autres réservations
    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        propertyId,
        date: reservationDate,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (overlappingReservation) {
      return apiResponse({ status: 400, message: "Créneau déjà réservé" });
    }

    // Vérifier chevauchement avec exceptions 
    const overlappingException = await prisma.availabilityException.findFirst({
      where: {
        propertyId,
        OR: [
          // date 
          { date: reservationDate, startTime: { lt: endTime }, endTime: { gt: startTime } },
          // jour de semaine
          { dayOfWeek: dayOfWeek as any, startTime: { lt: endTime }, endTime: { gt: startTime } },
          // jour du mois
          { dayOfMonth: dayOfMonth, startTime: { lt: endTime }, endTime: { gt: startTime } }
        ]
      }
    });

    if (overlappingException) {
      return apiResponse({ status: 400, message: "Créneau indisponible (exception)" });
    }

    // Vérifier que le bien existe
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return apiResponse({ status: 404, message: "Bien introuvable" });
    }

    // Créer la réservation 
    const reservation = await prisma.reservation.create({
      data: {
        propertyId,
        ownerId: property.userId,
        clientId: decodedUser.id,
        date: reservationDate,
        startTime,
        endTime,
        status: "pending"
      }
    });

    return apiResponse({
      status: 201,
      message: "Réservation créée",
      data: reservation
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}

// GET all reservations avec filtres
export async function GET(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filters: any = {};

    const propertyId = searchParams.get("propertyId");
    const ownerId = searchParams.get("ownerId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (propertyId) filters.propertyId = propertyId;
    if (ownerId) filters.ownerId = ownerId;
    if (clientId) filters.clientId = clientId;
    if (status) filters.status = status;
    if (date) filters.date = new Date(date);
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.reservation.count({ where: filters })
    ]);

    return apiResponse({
      status: 200,
      message: "Liste des réservations",
      data: { reservations, total, page, limit }
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}
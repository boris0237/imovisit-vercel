/**
 * @swagger
 * /api/agenda/reservation:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une réservation
 *     description: Crée une réservation pour un bien en vérifiant les conflits de plage horaire et les exceptions de disponibilité du propriétaire.
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
 *                 format: date
 *                 example: "2025-06-15"
 *                 description: Date de réservation (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 example: "13:30"
 *                 description: Heure de début (HH:MM)
 *               endTime:
 *                 type: string
 *                 example: "14:30"
 *                 description: Heure de fin (HH:MM)
 *               visitType:
 *                 type: string
 *                 enum: [in_person, remote]
 *                 default: in_person
 *                 description: Type de visite (défaut in_person)
 *               visitContext:
 *                 type: string
 *                 nullable: true
 *                 description: Contexte libre de la visite (adresse, lien, note...)
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
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
 *       403:
 *         description: Le propriétaire ne peut pas réserver son propre bien
 *       404:
 *         description: Bien immobilier introuvable
 *       409:
 *         description: Conflit — cette plage horaire est déjà réservée
 *       500:
 *         description: Erreur interne du serveur
 *
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Lister et filtrer les réservations
 *     description: Récupère les réservations avec filtres dynamiques et pagination.
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
 *           format: date
 *         description: Filtrer par date exacte (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des réservations récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       propertyId:
 *                         type: string
 *                       ownerId:
 *                         type: string
 *                       clientId:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       visitType:
 *                         type: string
 *                         enum: [in_person, remote]
 *                       visitContext:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, cancelled]
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";



// Créer une réservation
export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const { propertyId, date, startTime, endTime, visitType, visitContext } = await req.json();
    const decodedUser = (req as any).user;
    const reservationDate = new Date(date);

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
      return apiResponse({ status: 404, message: "Bien immobilier introuvable" });

    if (property.userId === decodedUser.id)
      return apiResponse({ status: 403, message: "Vous ne pouvez pas réserver votre propre bien" });

    const timeFilter = { AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }] };

    const exception = await prisma.availabilityException.findFirst({
      where: {
        ownerId: property.userId,
        OR: [
          { date: reservationDate, ...timeFilter },
          { dateStart: { lte: reservationDate }, dateEnd: { gte: reservationDate } }
        ]
      }
    });
    if (exception)
      return apiResponse({ status: 400, message: "Plage horaire non disponible" });

    const conflict = await prisma.reservation.findFirst({
      where: { propertyId, date: reservationDate, status: { in: ["pending", "confirmed"] }, ...timeFilter }
    });
    if (conflict)
      return apiResponse({ status: 409, message: "Cette plage horaire est déjà réservée" });

    const reservation = await prisma.reservation.create({
      data: {
        propertyId,
        ownerId: property.userId,
        clientId: decodedUser.id,
        date: reservationDate,
        startTime,
        endTime,
        visitType: visitType ?? "in_person",
        visitContext: visitContext ?? null
      }
    });

    return apiResponse({ status: 201, message: "Réservation créée avec succès", data: reservation });

  } catch (err: any) {
    console.error("[POST /reservation]", err);
    return apiResponse({ status: 500, message: "Erreur interne du serveur" });
  }
}


// lister et filtrer les reservation
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

    if (propertyId) filters.propertyId = propertyId;
    if (ownerId) filters.ownerId = ownerId;
    if (clientId) filters.clientId = clientId;
    if (status) filters.status = status;
    if (date) filters.date = new Date(date);

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
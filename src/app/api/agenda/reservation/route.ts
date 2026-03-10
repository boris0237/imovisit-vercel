/**
 * @swagger
 * /api/agenda/reservation:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une réservation
 *     description: Crée une réservation pour un bien en vérifiant les chevauchements avec d'autres réservations et les exceptions. Génère le contexte de visite (adresse ou lien WhatsApp).
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
 *               - visitType
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID du bien
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date de réservation (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 example: "13:30"
 *                 description: Heure de début
 *               endTime:
 *                 type: string
 *                 example: "14:30"
 *                 description: Heure de fin
 *               visitType:
 *                 type: string
 *                 enum: [in_person, remote]
 *                 description: Type de visite
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
 *                   description: Adresse ou lien WhatsApp pour la visite
 *                 status:
 *                   type: string
 *                   enum: [pending, confirmed, cancelled]
 *       400:
 *         description: Créneau déjà réservé ou champs manquants
 *       403:
 *         description: Visite à distance réservée aux comptes premium
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Bien ou propriétaire introuvable
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
 *           format: date
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
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, cancelled]
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
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
    const { propertyId, date, startTime, endTime, visitType } = body;

    if (!propertyId || !date || !startTime || !endTime || !visitType) {
      return apiResponse({ status: 400, message: "Champs obligatoires manquants" });
    }

    const decodedUser = (req as any).user;
    const reservationDate = new Date(date);
    const dayOfWeek = reservationDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const dayOfMonth = reservationDate.getDate();

    // Vérifier bien
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return apiResponse({ status: 404, message: "Bien introuvable" });
    }

    // Vérifier propriétaire
    const owner = await prisma.user.findUnique({
      where: { id: property.userId }
    });

    if (!owner) {
      return apiResponse({ status: 404, message: "Propriétaire introuvable" });
    }

    if (property.userId === decodedUser.id) {
      return apiResponse({
        status: 400,
        message: "Vous ne pouvez pas réserver votre propre bien"
      });
    }

    // Vérification Premium
    if (visitType === "remote" && owner.typeCompte !== "premium") {
      return apiResponse({
        status: 403,
        message: "Visite à distance réservée aux comptes premium"
      });
    }

    // Vérifier conflit réservation
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

    // Vérifier exceptions
    const overlappingException = await prisma.availabilityException.findFirst({
      where: {
        propertyId,
        OR: [
          { date: reservationDate, startTime: { lt: endTime }, endTime: { gt: startTime } },
          { dayOfWeek: dayOfWeek as any, startTime: { lt: endTime }, endTime: { gt: startTime } },
          { dayOfMonth: dayOfMonth, startTime: { lt: endTime }, endTime: { gt: startTime } }
        ]
      }
    });

    if (overlappingException) {
      return apiResponse({ status: 400, message: "Créneau indisponible (exception)" });
    }

    // Génération contexte visite
    let visitContext = "";

    if (visitType === "remote") {
      visitContext = `https://wa.me/${owner.phone}`;
    } else {
      visitContext = property.address;
    }

    // Créer réservation
    const reservation = await prisma.reservation.create({
      data: {
        propertyId,
        ownerId: property.userId,
        clientId: decodedUser.id,
        date: reservationDate,
        startTime,
        endTime,
        visitType: "in_person",
        visitContext: property.address,

        status: "pending",
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
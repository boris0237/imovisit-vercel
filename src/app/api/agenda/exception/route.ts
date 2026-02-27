/**
 * @swagger
 * /api/agenda/exception:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une exception de disponibilité
 *     description: Permet au propriétaire de bloquer une date ou une plage horaire (congé, indisponibilité ponctuelle).
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
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID du bien concerné
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date spécifique à bloquer
 *               startTime:
 *                 type: string
 *                 example: "14:00"
 *               endTime:
 *                 type: string
 *                 example: "18:00"
 *               reason:
 *                 type: string
 *                 example: "Congé"
 *     responses:
 *       201:
 *         description: Exception créée avec succès
 *       400:
 *         description: propertyId requis
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer la liste des exceptions
 *     description: Permet de récupérer les exceptions avec filtres dynamiques (propriété, propriétaire, date, plage horaire).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filtrer par ID du bien
 *
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filtrer par ID du propriétaire
 *
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *         description: Filtrer par jour de la semaine
 *
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par date exacte
 *
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début de période
 *
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin de période
 *
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *         description: Filtrer par heure de début
 *
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *         description: Filtrer par heure de fin
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *
 *     responses:
 *       200:
 *         description: Liste des exceptions récupérée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";


// CREATE exception
export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { propertyId, date, startTime, endTime, reason } = body;

    if (!propertyId) {
      return apiResponse({ status: 400, message: "propertyId requis" });
    }

    const decodedUser = (req as any).user;

    const exception = await prisma.availabilityException.create({
      data: {
        ownerId: decodedUser.id,
        propertyId,
        date: date ? new Date(date) : null,
        startTime,
        endTime,
        reason
      }
    });

    return apiResponse({
      status: 201,
      message: "Exception créée",
      data: exception
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}


// GET all exceptions avec filtres dynamiques
export async function GET(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filtres dynamiques
    const filters: any = {};

    const propertyId = searchParams.get("propertyId");
    const ownerId = searchParams.get("ownerId");
    const dayOfWeek = searchParams.get("dayOfWeek");
    const date = searchParams.get("date");
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");


    // Filtres simples
    if (propertyId) filters.propertyId = propertyId;
    if (ownerId) filters.ownerId = ownerId;
    if (dayOfWeek) filters.dayOfWeek = dayOfWeek;
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;

    // Filtre date exacte
    if (date) {
      filters.date = new Date(date);
    }

    // Filtre période
    if (dateStart || dateEnd) {
      filters.date = {};
      if (dateStart) filters.date.gte = new Date(dateStart);
      if (dateEnd) filters.date.lte = new Date(dateEnd);
    }

    const [exceptions, total] = await Promise.all([
      prisma.availabilityException.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.availabilityException.count({
        where: filters,
      }),
    ]);

    return apiResponse({
      status: 200,
      message: "Liste des exceptions",
      data: {
        exceptions,
        total,
        page,
        limit,
      },
    });

  } catch (error: any) {
    console.log(error.message);
    return apiResponse({
      status: 500,
      message: error.message || "Erreur récupération exceptions",
    });
  }
}
/**
 * @swagger
 * /api/agenda/exception:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une exception de disponibilité
 *     description: Permet au propriétaire de bloquer une date précise, une période ou un jour récurrent.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Jour précis à bloquer
 *                 example: "2026-03-20T00:00:00.000Z"
 *
 *               dateStart:
 *                 type: string
 *                 format: date-time
 *                 description: Début d'une période d'indisponibilité
 *                 example: "2026-03-22T00:00:00.000Z"
 *
 *               dateEnd:
 *                 type: string
 *                 format: date-time
 *                 description: Fin d'une période d'indisponibilité
 *                 example: "2026-03-26T00:00:00.000Z"
 *
 *               dayOfWeek:
 *                 type: string
 *                 enum:
 *                   - monday
 *                   - tuesday
 *                   - wednesday
 *                   - thursday
 *                   - friday
 *                   - saturday
 *                   - sunday
 *                 description: Bloquer un jour spécifique de la semaine
 *                 example: sunday
 *
 *               dayOfMonth:
 *                 type: integer
 *                 description: Bloquer un jour précis du mois
 *                 example: 5
 *
 *               startTime:
 *                 type: string
 *                 description: Heure de début
 *                 example: "14:00"
 *
 *               endTime:
 *                 type: string
 *                 description: Heure de fin
 *                 example: "18:00"
 *
 *               reason:
 *                 type: string
 *                 description: Raison de l'indisponibilité
 *                 example: Vacances
 *
 *     responses:
 *       201:
 *         description: Exception créée avec succès
 *
 *       400:
 *         description: Mauvaise requête
 *
 *       401:
 *         description: Non autorisé
 *
 *       500:
 *         description: Erreur serveur
 *
 *
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer la liste des exceptions
 *     description: Permet de récupérer les exceptions avec filtres dynamiques.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filtrer par propriétaire
 *
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum:
 *             - monday
 *             - tuesday
 *             - wednesday
 *             - thursday
 *             - friday
 *             - saturday
 *             - sunday
 *         description: Filtrer par jour de la semaine
 *
 *       - in: query
 *         name: dayOfMonth
 *         schema:
 *           type: integer
 *         description: Filtrer par jour du mois
 *
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par date précise
 *
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par début d'intervalle
 *
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrer par fin d'intervalle
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
 *           example: 1
 *         description: Numéro de page
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Nombre d'éléments par page
 *
 *     responses:
 *       200:
 *         description: Liste des exceptions récupérée avec succès
 *
 *       401:
 *         description: Non autorisé
 *
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
    const { propertyId, date, dateStart, dateEnd, startTime, endTime, reason } = body;

    if (!propertyId) {
      return apiResponse({ status: 400, message: "propertyId requis" });
    }

    const decodedUser = (req as any).user;

    const exception = await prisma.availabilityException.create({
      data: {
        ownerId: decodedUser.id,
        date: date ? new Date(date) : null,
        dateStart: dateStart ? new Date(dateStart) : null,
        dateEnd: dateEnd ? new Date(dateEnd) : null,
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
    const dayOfMonth = searchParams.get("dayOfMonth");
    const date = searchParams.get("date");
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    // Filtres simples
    if (propertyId) filters.propertyId = propertyId;
    if (ownerId) filters.ownerId = ownerId;
    if (dayOfWeek) filters.dayOfWeek = dayOfWeek;
    if (dayOfMonth) filters.dayOfMonth = parseInt(dayOfMonth);
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;

    // Filtre pour une date précise
    if (date) {
      filters.date = new Date(date);
    }

    // Filtre pour une période (dateStart / dateEnd)
    if (dateStart || dateEnd) {
      filters.OR = [
        {
          dateStart: { lte: dateEnd ? new Date(dateEnd) : undefined },
          dateEnd: { gte: dateStart ? new Date(dateStart) : undefined }
        },
        {
          date: {
            gte: dateStart ? new Date(dateStart) : undefined,
            lte: dateEnd ? new Date(dateEnd) : undefined
          }
        }
      ];
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
      data: { exceptions, total, page, limit },
    });

  } catch (error: any) {
    console.error(error.message);
    return apiResponse({
      status: 500,
      message: error.message || "Erreur récupération exceptions",
    });
  }
}
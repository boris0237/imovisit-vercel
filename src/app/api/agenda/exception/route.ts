/**
 * @swagger
 * /api/agenda/exception:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une exception de disponibilité
 *     description: |
 *       Permet au propriétaire de bloquer sa disponibilité.
 *       L'ownerId est automatiquement récupéré depuis le token d'authentification.
 *
 *       Deux types de JSON sont possibles :
 *
 *       1. Bloquer un intervalle de jours :
 *       {
 *         "dateStart": "2026-03-22",
 *         "dateEnd": "2026-03-26",
 *         "reason": "vacances"
 *       }
 *
 *       2. Bloquer un jour précis avec heures :
 *       {
 *         "date": "2026-03-20",
 *         "startTime": "10:00",
 *         "endTime": "16:00",
 *         "reason": "maintenance"
 *       }
 *
 *       Types d'exceptions possibles :
 *       - Jour précis
 *       - Intervalle de jours
 *       - Jour de la semaine récurrent
 *       - Jour du mois récurrent
 *
 *     security:
 *       - bearerAuth: []
 *
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
 *                 format: date
 *                 description: Bloquer un jour précis
 *                 example: "2026-03-20"
 *
 *               dateStart:
 *                 type: string
 *                 format: date
 *                 description: Début d'un intervalle de jours
 *                 example: "2026-03-22"
 *
 *               dateEnd:
 *                 type: string
 *                 format: date
 *                 description: Fin d'un intervalle de jours
 *                 example: "2026-03-26"
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
 *                 example: "sunday"
 *
 *               dayOfMonth:
 *                 type: integer
 *                 description: Bloquer un jour précis du mois
 *                 example: 5
 *
 *               startTime:
 *                 type: string
 *                 description: Heure de début de l'indisponibilité
 *                 example: "10:00"
 *
 *               endTime:
 *                 type: string
 *                 description: Heure de fin de l'indisponibilité
 *                 example: "16:00"
 *
 *               reason:
 *                 type: string
 *                 description: Raison de l'indisponibilité
 *                 example: "Vacances"
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
    const { date, dateStart, dateEnd, startTime, endTime, reason } = body;

    const decodedUser = (req as any).user;

    // CAS 1 : INTERVALLE DE JOURS
    if (dateStart && dateEnd) {

      const start = new Date(dateStart);
      const end = new Date(dateEnd);

      // vérifier chevauchement intervalle ↔ intervalle
      const intervalExist = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          dateStart: { not: null },
          AND: [
            { dateStart: { lte: end } },
            { dateEnd: { gte: start } }
          ]
        }
      });

      if (intervalExist) {
        return apiResponse({
          status: 400,
          message: "Un intervalle existe déjà dans cette période"
        });
      }

      // vérifier si un jour précis existe dans cet intervalle
      const dayInsideInterval = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          date: {
            gte: start,
            lte: end
          }
        }
      });

      if (dayInsideInterval) {
        return apiResponse({
          status: 400,
          message: "Un jour précis est déjà bloqué dans cet intervalle"
        });
      }
    }

    // CAS 2 : JOUR + HEURE
    if (date && startTime && endTime) {

      const day = new Date(date);

      // vérifier si un intervalle couvre ce jour
      const intervalCover = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          dateStart: { lte: day },
          dateEnd: { gte: day }
        }
      });

      if (intervalCover) {
        return apiResponse({
          status: 400,
          message: "Ce jour est déjà bloqué par un intervalle"
        });
      }

      // vérifier chevauchement horaire
      const hourConflict = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          date: day,
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } }
          ]
        }
      });

      if (hourConflict) {
        return apiResponse({
          status: 400,
          message: "Une exception horaire existe déjà"
        });
      }
    }

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

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

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

    if (propertyId) filters.propertyId = propertyId;
    if (ownerId) filters.ownerId = ownerId;
    if (dayOfMonth) filters.dayOfMonth = parseInt(dayOfMonth);
    if (startTime) filters.startTime = startTime;
    if (endTime) filters.endTime = endTime;

    if (date) {
      filters.date = new Date(date);
    }

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

    let exceptions = await prisma.availabilityException.findMany({
      where: filters,
      orderBy: { createdAt: "desc" }
    });

    // FILTRE PAR JOUR (calculé depuis la date)
    if (dayOfWeek) {

      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];

      exceptions = exceptions.filter((e) => {

        // sinon on calcule depuis date
        if (e.date) {
          const d = new Date(e.date);
          const day = days[d.getDay()];
          return day === dayOfWeek;
        }

        // si intervalle
        if (e.dateStart && e.dateEnd) {
          const start = new Date(e.dateStart);
          const end = new Date(e.dateEnd);

          let current = new Date(start);

          while (current <= end) {
            if (days[current.getDay()] === dayOfWeek) {
              return true;
            }
            current.setDate(current.getDate() + 1);
          }
        }

        return false;
      });
    }

    const total = exceptions.length;

    const paginated = exceptions.slice(skip, skip + limit);

    return apiResponse({
      status: 200,
      message: "Liste des exceptions",
      data: {
        exceptions: paginated,
        total,
        page,
        limit
      }
    });

  } catch (error: any) {
    console.error(error.message);
    return apiResponse({
      status: 500,
      message: error.message || "Erreur récupération exceptions",
    });
  }
}
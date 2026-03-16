/**
 * @swagger
 * /api/agenda/rules:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une disponibilité
 *     description: |
 *       Permet au propriétaire de définir une plage horaire disponible pour un jour précis.
 *       Vérifie automatiquement les exceptions existantes et les chevauchements pour éviter les doublons.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Jour pour lequel la disponibilité est définie
 *                 example: "2026-03-18"
 *               startTime:
 *                 type: string
 *                 description: Heure de début de la disponibilité (format HH:MM 24h)
 *                 example: "11:00"
 *               endTime:
 *                 type: string
 *                 description: Heure de fin de la disponibilité (format HH:MM 24h)
 *                 example: "13:00"
 *     responses:
 *       201:
 *         description: Disponibilité créée avec succès
 *       400:
 *         description: La date est déjà bloquée par une exception ou chevauche une autre disponibilité
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer les disponibilités
 *     description: Permet de récupérer les disponibilités avec filtres dynamiques (propriétaire, date, plage horaire).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: Filtrer par ID du propriétaire
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par jour précis
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
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Disponibilités récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */


import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

// Créer une disponibilité
export async function POST(req: NextRequest) {
  try {

    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return apiResponse({
        status: 400,
        message: "date, startTime et endTime sont obligatoires"
      });
    }

    const decodedUser = (req as any).user;
    const dateObj = new Date(date);

    // Vérifier exception
    const exception = await prisma.availabilityException.findFirst({
      where: {
        ownerId: decodedUser.id,
        OR: [
          { date: dateObj },
          {
            dateStart: { lte: dateObj },
            dateEnd: { gte: dateObj }
          }
        ]
      }
    });

    if (exception) {
      return apiResponse({
        status: 400,
        message: "Impossible : une exception existe sur cette date"
      });
    }

    // Vérifier doublon / chevauchement
    const existingAvailability = await prisma.availabilityRule.findFirst({
      where: {
        ownerId: decodedUser.id,
        date: dateObj,
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      }
    });

    if (existingAvailability) {
      return apiResponse({
        status: 400,
        message: "Cette plage horaire existe déjà pour cette date"
      });
    }

    // Création
    const rule = await prisma.availabilityRule.create({
      data: {
        ownerId: decodedUser.id,
        date: dateObj,
        startTime,
        endTime
      }
    });

    return apiResponse({
      status: 201,
      message: "Disponibilité créée",
      data: rule
    });

  } catch (err: any) {
    console.log(err);
    return apiResponse({
      status: 500,
      message: err.message || "Erreur serveur"
    });
  }
}


// Lister les disponibilités
export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const filters: any = {};

    const ownerId = searchParams.get("ownerId");
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (ownerId) filters.ownerId = ownerId;

    if (date) {
      filters.date = new Date(date);
    }

    if (startTime) filters.startTime = startTime;

    if (endTime) filters.endTime = endTime;

    const [rules, total] = await Promise.all([
      prisma.availabilityRule.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { date: "asc" }
      }),
      prisma.availabilityRule.count({
        where: filters
      })
    ]);

    return apiResponse({
      status: 200,
      message: "Disponibilités récupérées",
      data: {
        rules,
        total,
        page,
        limit
      }
    });

  } catch (err: any) {
    console.log(err);
    return apiResponse({
      status: 500,
      message: err.message || "Erreur serveur"
    });
  }
}
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
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isOverlap(start1: string, end1: string, start2: string, end2: string) {
  return (
    toMinutes(start1) < toMinutes(end2) &&
    toMinutes(end1) > toMinutes(start2)
  );
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 auth
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return apiResponse({
        status: 400,
        message: "date, startTime et endTime sont obligatoires",
      });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return apiResponse({
        status: 400,
        message: "Date invalide",
      });
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return apiResponse({
        status: 400,
        message: "startTime doit être inférieur à endTime",
      });
    }

    const decodedUser = (req as any).user;
    const ownerId = decodedUser.id;

    // 1. CHECK EXCEPTIONS 
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        ownerId,
        OR: [
          { date: dateObj },
          {
            dateStart: { lte: dateObj },
            dateEnd: { gte: dateObj },
          },
        ],
      },
    });

    for (const e of exceptions) {
      // journée complète bloquée
      if (!e.startTime && !e.endTime) {
        return apiResponse({
          status: 400,
          message: "Impossible : journée entièrement bloquée",
        });
      }

      // chevauchement partiel uniquement
      if (e.startTime && e.endTime) {
        if (isOverlap(startTime, endTime, e.startTime, e.endTime)) {
          return apiResponse({
            status: 400,
            message: "Impossible : chevauchement avec une exception",
          });
        }
      }
    }

    // 2. CHECK EXISTING AVAILABILITY
    const existingRules = await prisma.availabilityRule.findMany({
      where: {
        ownerId,
        date: dateObj,
      },
    });

    for (const rule of existingRules) {
      if (isOverlap(startTime, endTime, rule.startTime, rule.endTime)) {
        return apiResponse({
          status: 400,
          message: "Cette plage chevauche une disponibilité existante",
        });
      }
    }

    // 3. CREATE 
    const newRule = await prisma.availabilityRule.create({
      data: {
        ownerId,
        date: dateObj,
        startTime,
        endTime,
      },
    });

    return apiResponse({
      status: 201,
      message: "Disponibilité créée avec succès",
      data: newRule,
    });

  } catch (err: any) {
    console.error("[CREATE AVAILABILITY ERROR]", err);

    return apiResponse({
      status: 500,
      message: err.message || "Erreur interne du serveur",
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
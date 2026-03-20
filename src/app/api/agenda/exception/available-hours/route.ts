/**
 * @swagger
 * api/agenda/exception/available-hours:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer les exceptions d'un utilisateur pour une date donnée
 *     description: |
 *       Permet de récupérer toutes les plages bloquées (exceptions) pour un propriétaire donné sur un jour précis.
 *       Les exceptions peuvent être :
 *         - un blocage total de la journée
 *         - un blocage partiel (heures spécifiques)
 *         - un intervalle couvrant plusieurs jours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du propriétaire pour lequel récupérer les exceptions
 *         example: "69b918a84a7612027ee115e1"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date pour laquelle récupérer les exceptions
 *         example: "2026-08-17"
 *     responses:
 *       200:
 *         description: Exceptions récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Exceptions récupérées"
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-17"
 *                     exceptionSlots:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30"]
 *       400:
 *         description: Paramètres manquants ou invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// @ts-nocheck
import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

// Utils
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generateSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  let current = toMinutes(start);
  const endMinutes = toMinutes(end);

  while (current + 30 <= endMinutes) {
    slots.push(fromMinutes(current));
    current += 30;
  }

  return slots;
}

// GET Exceptions 
export async function GET(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const date = searchParams.get("date");

    if (!ownerId || !date) {
      return apiResponse({
        status: 400,
        message: "ownerId et date sont requis",
      });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return apiResponse({
        status: 400,
        message: "Date invalide",
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Récupérer toutes les exceptions pour ce user et cette date
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        ownerId,
        OR: [
          { date: targetDate }, // jour précis
          {
            dateStart: { lte: endOfDay },
            dateEnd: { gte: startOfDay }, // intervalle couvrant la date
          },
        ],
      },
    });

    if (!exceptions || exceptions.length === 0) {
      return apiResponse({
        status: 200,
        message: "Aucune exception pour ce jour",
        data: { date, exceptionSlots: [] },
      });
    }

    const exceptionSlots = new Set<string>();

    for (const e of exceptions) {
      // Journée entière bloquée
      if (!e.startTime && !e.endTime) {
        return apiResponse({
          status: 200,
          message: "Journée complètement bloquée",
          data: { date, exceptionSlots: ["ALL_DAY"] },
        });
      }

      // Blocage partiel (heure)
      if (e.startTime && e.endTime) {
        generateSlots(e.startTime, e.endTime).forEach((s) =>
          exceptionSlots.add(s)
        );
      }
    }

    return apiResponse({
      status: 200,
      message: "Exceptions récupérées",
      data: { date, exceptionSlots: Array.from(exceptionSlots) },
    });
  } catch (err: any) {
    console.error("[EXCEPTIONS]", err);
    return apiResponse({
      status: 500,
      message: err.message || "Erreur interne du serveur",
    });
  }
}
export const dynamic = 'force-dynamic';

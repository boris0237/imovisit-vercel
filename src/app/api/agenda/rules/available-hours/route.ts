// @ts-nocheck
/**
 * @swagger
 * /api/agenda/rules/available-hours:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer les heures disponibles pour visiter un bien
 *     description: |
 *       Retourne la liste des heures disponibles pour une visite sur un bien donné, à une date précise.
 *       
 *       🔹 Les horaires sont calculés à partir :
 *       - des disponibilités du propriétaire
 *       - des exceptions (congés, indisponibilités)
 *       - des réservations existantes sur ce bien
 *       
 *       🔹 Comportement :
 *       - Les créneaux sont générés par pas de 30 minutes
 *       - Si aucune disponibilité n’est définie → plage par défaut (08:30 à 17:00)
 *       - Les créneaux bloqués par exception sont exclus
 *       - Les créneaux déjà réservés sont exclus
 *       - Si la date est aujourd’hui → les heures passées sont supprimées
 *       - Si toute la journée est bloquée → retourne un tableau vide
 *       
 *       🔹 Format de sortie :
 *       - Tableau simple d’heures (HH:mm)
 *       - Ordre chronologique
 *
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du bien immobilier
 *         example: "65f1a2c4e12ab34d56789abc"
 *
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de visite souhaitée (format YYYY-MM-DD)
 *         example: "2026-03-18"
 *
 *     responses:
 *       200:
 *         description: Heures disponibles récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   example: "2026-03-18"
 *                 availableHours:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "09:00"
 *             examples:
 *               success:
 *                 summary: Exemple avec disponibilités
 *                 value:
 *                   date: "2026-03-18"
 *                   availableHours: [
 *                     "08:30",
 *                     "09:00",
 *                     "09:30",
 *                     "10:00",
 *                     "14:00",
 *                     "14:30",
 *                     "15:00"
 *                   ]
 *
 *               noAvailability:
 *                 summary: Aucune disponibilité
 *                 value:
 *                   date: "2026-03-18"
 *                   availableHours: []
 *
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               message: "propertyId et date sont requis"
 *
 *       404:
 *         description: Bien introuvable
 *         content:
 *           application/json:
 *             example:
 *               status: 404
 *               message: "Bien introuvable"
 *
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               status: 500
 *               message: "Erreur interne du serveur"
 */



import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

// CONFIG Plage heure par default
const DEFAULT_START = "08:30";
const DEFAULT_END = "17:00";

// UTILS
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

// affiche heure dispo lier au Bien
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const propertyId = searchParams.get("propertyId");
    const date = searchParams.get("date");

    if (!propertyId || !date) {
      return apiResponse({
        status: 400,
        message: "propertyId et date sont requis",
      });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return apiResponse({
        status: 400,
        message: "Date invalide",
      });
    }

    // correction dimanche
    const jsDay = targetDate.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    // 1. PROPERTY
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!property) {
      return apiResponse({
        status: 404,
        message: "Bien introuvable",
      });
    }

    const ownerId = property.userId;

    // 2. RULES 
    const rules = await prisma.availabilityRule.findMany({
      where: {
        ownerId,
        OR: [
          { date: { gte: startOfDay, lte: endOfDay } },
          { dayOfWeek },
        ],
      },
    });

    // 3. GENERATE SLOTS
    const slotSet = new Set<string>();

    // fallback si aucune règle
    if (rules.length === 0) {
      generateSlots(DEFAULT_START, DEFAULT_END).forEach((s) =>
        slotSet.add(s)
      );
    } else {
      for (const rule of rules) {
        generateSlots(rule.startTime, rule.endTime).forEach((s) =>
          slotSet.add(s)
        );
      }
    }

    // 4. EXCEPTIONS
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        ownerId,
        OR: [
          { date: { gte: startOfDay, lte: endOfDay } },
          {
            dateStart: { lte: endOfDay },
            dateEnd: { gte: startOfDay },
          },
        ],
      },
    });

    const exceptionSet = new Set<string>();

    for (const e of exceptions) {
      // journée totalement bloquée
      if (!e.startTime && !e.endTime) {
        return apiResponse({
          status: 200,
          message: "Journée bloquée",
          data: { date, availableHours: [] },
        });
      }

      // blocage partiel
      if (e.startTime && e.endTime) {
        generateSlots(e.startTime, e.endTime).forEach((s) =>
          exceptionSet.add(s)
        );
      }
    }

    // 5. RESERVATIONS 
    const reservations = await prisma.reservation.findMany({
      where: {
        ownerId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ["pending", "confirmed"] },
      },
    });

    const reservedSet = new Set<string>();

    for (const r of reservations) {
      const resDateStr = new Date(r.date).toISOString().split("T")[0];
      if (resDateStr !== targetDateStr) continue;
      generateSlots(r.startTime, r.endTime).forEach((s) => reservedSet.add(s));
    }

    // 6. FILTER
    let slots = Array.from(slotSet).filter(
      (s) => !exceptionSet.has(s) && !reservedSet.has(s)
    );

    // 7. REMOVE PAST
    const todayStr = new Date().toISOString().split("T")[0];

    if (todayStr === date) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      slots = slots.filter((s) => toMinutes(s) > nowMinutes);
    }

    // 8. SORT 
    slots.sort((a, b) => toMinutes(a) - toMinutes(b));

    return apiResponse({
      status: 200,
      message: "Heures disponibles",
      data: {
        date,
        availableHours: slots,
      },
    });
  } catch (error) {
    console.error("[AVAILABLE HOURS]", error);

    return apiResponse({
      status: 500,
      message: "Erreur interne du serveur",
    });
  }
}

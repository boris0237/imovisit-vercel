/**
 * @swagger
 * /api/agenda/rule:
 *   post:
 *     tags:
 *       - Agenda
 *     summary: Créer une règle de disponibilité
 *     description: Permet au propriétaire de définir des jours et plages horaires disponibles pour un bien.
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
 *               - recurrenceType
 *               - startTime
 *               - endTime
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID du bien concerné
 *               recurrenceType:
 *                 type: string
 *                 enum: [weekly, monthly]
 *                 description: Type de récurrence
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 description: Jour de la semaine (si récurrence hebdomadaire)
 *               dayOfMonth:
 *                 type: integer
 *                 description: Jour du mois (si récurrence mensuelle)
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       201:
 *         description: Règle créée avec succès
 *       400:
 *         description: Champs obligatoires manquants
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer les règles de disponibilité
 *     description: Permet de récupérer les règles avec filtres dynamiques (propriété, propriétaire, type, jour).
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
 *         name: recurrenceType
 *         schema:
 *           type: string
 *           enum: [weekly, monthly]
 *         description: Filtrer par type de récurrence
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *         description: Filtrer par jour de la semaine
 *       - in: query
 *         name: dayOfMonth
 *         schema:
 *           type: integer
 *         description: Filtrer par jour du mois
 *     responses:
 *       200:
 *         description: Liste des règles récupérée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */


import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

// --- Créer une règle ---
export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { propertyId, recurrenceType, dayOfWeek, dayOfMonth, startTime, endTime } = body;

    if (!propertyId || !recurrenceType || !startTime || !endTime) {
      return apiResponse({ status: 400, message: "Champs obligatoires manquants" });
    }

    const decodedUser = (req as any).user;

    const rule = await prisma.availabilityRule.create({
      data: {
        ownerId: decodedUser.id,
        propertyId,
        recurrenceType,
        dayOfWeek,
        dayOfMonth,
        startTime,
        endTime
      }
    });

    return apiResponse({
      status: 201,
      message: "Règle créée",
      data: rule
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}

// --- Lister les règles avec filtres ---
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: any = {};
    const propertyId = searchParams.get("propertyId");
    const ownerId = searchParams.get("ownerId");
    const recurrenceType = searchParams.get("recurrenceType");
    const dayOfWeek = searchParams.get("dayOfWeek");
    const dayOfMonth = searchParams.get("dayOfMonth");

    if (propertyId) filters.propertyId = propertyId;
    if (ownerId) filters.ownerId = ownerId;
    if (recurrenceType) filters.recurrenceType = recurrenceType;
    if (dayOfWeek) filters.dayOfWeek = dayOfWeek;
    if (dayOfMonth) filters.dayOfMonth = parseInt(dayOfMonth);

    const rules = await prisma.availabilityRule.findMany({
      where: filters,
      orderBy: { createdAt: "desc" }
    });

    return apiResponse({ status: 200, message: "Règles récupérées", data: rules });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}
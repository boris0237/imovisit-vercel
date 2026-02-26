/**
 * @swagger
 * /api/agenda/rule/{id}:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer une règle de disponibilité
 *     description: Permet de récupérer une règle par son ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la règle
 *     responses:
 *       200:
 *         description: Règle récupérée
 *       404:
 *         description: Règle introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   patch:
 *     tags:
 *       - Agenda
 *     summary: Mettre à jour une règle de disponibilité
 *     description: Permet de modifier une règle existante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la règle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recurrenceType:
 *                 type: string
 *                 enum: [weekly, monthly]
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               dayOfMonth:
 *                 type: integer
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Règle mise à jour
 *       404:
 *         description: Règle introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 *   delete:
 *     tags:
 *       - Agenda
 *     summary: Supprimer une règle de disponibilité
 *     description: Permet de supprimer une règle par son ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la règle
 *     responses:
 *       200:
 *         description: Règle supprimée
 *       404:
 *         description: Règle introuvable
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

interface Params {
  params: { id: string };
}

// --- GET ONE ---
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const rule = await prisma.availabilityRule.findUnique({
      where: { id: params.id }
    });

    if (!rule) return apiResponse({ status: 404, message: "Règle introuvable" });

    return apiResponse({ status: 200, message: "Règle récupérée", data: rule });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}

// --- PATCH ---
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();

    const updated = await prisma.availabilityRule.update({
      where: { id: params.id },
      data: {
        ...body
      }
    });

    return apiResponse({ status: 200, message: "Règle mise à jour", data: updated });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}

// --- DELETE ---
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    await prisma.availabilityRule.delete({ where: { id: params.id } });

    return apiResponse({ status: 200, message: "Règle supprimée" });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}
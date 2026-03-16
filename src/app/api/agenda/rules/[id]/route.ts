/**
 * @swagger
 * /api/agenda/rules/{id}:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer une disponibilité
 *     description: Permet de récupérer une disponibilité par son ID.
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la disponibilité
 *
 *     responses:
 *       200:
 *         description: Disponibilité récupérée avec succès
 *
 *       404:
 *         description: Disponibilité introuvable
 *
 *       401:
 *         description: Non autorisé
 *
 *       500:
 *         description: Erreur serveur
 *
 *
 *   patch:
 *     tags:
 *       - Agenda
 *     summary: Mettre à jour une disponibilité
 *     description: |
 *       Permet de modifier une disponibilité existante.
 *
 *       Si un chevauchement d'horaire existe déjà pour cette date,
 *       la modification est refusée afin d'éviter les doublons de créneaux.
 *
 *       Format JSON attendu :
 *
 *       {
 *         "date": "2026-03-18",
 *         "startTime": "11:00",
 *         "endTime": "13:00"
 *       }
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la disponibilité
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
 *                 example: "2026-03-18"
 *
 *               startTime:
 *                 type: string
 *                 example: "11:00"
 *
 *               endTime:
 *                 type: string
 *                 example: "13:00"
 *
 *     responses:
 *       200:
 *         description: Disponibilité mise à jour avec succès
 *
 *       400:
 *         description: Chevauchement détecté avec une autre disponibilité
 *
 *       404:
 *         description: Disponibilité introuvable
 *
 *       401:
 *         description: Non autorisé
 *
 *       500:
 *         description: Erreur serveur
 *
 *
 *   delete:
 *     tags:
 *       - Agenda
 *     summary: Supprimer une disponibilité
 *     description: Permet de supprimer une disponibilité par son ID.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la disponibilité
 *
 *     responses:
 *       200:
 *         description: Disponibilité supprimée avec succès
 *
 *       404:
 *         description: Disponibilité introuvable
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

interface Params {
  params: { id: string };
}

// GET ONE
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

// PATCH disponibilité
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { date, startTime, endTime } = body;

    const decodedUser = (req as any).user;

    // récupérer la disponibilité actuelle
    const existing = await prisma.availabilityRule.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return apiResponse({
        status: 404,
        message: "Disponibilité introuvable"
      });
    }

    const newDate = date ? new Date(date) : existing.date;
    const newStartTime = startTime || existing.startTime;
    const newEndTime = endTime || existing.endTime;

    // vérifier chevauchement avec autre disponibilité
    const conflict = await prisma.availabilityRule.findFirst({
      where: {
        ownerId: decodedUser.id,
        id: { not: params.id },
        date: newDate,
        startTime: { lt: newEndTime },
        endTime: { gt: newStartTime }
      }
    });

    if (conflict) {
      return apiResponse({
        status: 400,
        message: "Une disponibilité existe déjà dans cet intervalle"
      });
    }

    // mise à jour
    const updated = await prisma.availabilityRule.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : undefined,
        startTime,
        endTime
      }
    });

    return apiResponse({
      status: 200,
      message: "Disponibilité mise à jour",
      data: updated
    });

  } catch (err: any) {
    console.log(err);

    if (err.code === "P2025") {
      return apiResponse({
        status: 404,
        message: "Disponibilité introuvable"
      });
    }

    return apiResponse({
      status: 500,
      message: err.message
    });
  }
}

// DELETE 
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    await prisma.availabilityRule.delete({ where: { id: params.id } });

    return apiResponse({ status: 200, message: "Règle supprimée" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return apiResponse({ status: 404, message: "Règle introuvable" });
    }
    return apiResponse({ status: 500, message: err.message });
  }
}
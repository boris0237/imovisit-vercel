/**
 * @swagger
 * /api/agenda/exception/{id}:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer une exception par ID
 *     description: Permet de récupérer une exception de disponibilité spécifique (congé ou indisponibilité ponctuelle).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'exception
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exception récupérée avec succès
 *       404:
 *         description: Exception non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   patch:
 *     tags:
 *       - Agenda
 *     summary: Modifier une exception
 *     description: Permet de modifier une exception de disponibilité existante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'exception
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               dateStart:
 *                 type: string
 *                 format: date-time
 *               dateEnd:
 *                 type: string
 *                 format: date-time
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               dayOfMonth:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 example: "14:00"
 *               endTime:
 *                 type: string
 *                 example: "18:00"
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exception mise à jour avec succès
 *       404:
 *         description: Exception non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   delete:
 *     tags:
 *       - Agenda
 *     summary: Supprimer une exception
 *     description: Permet de supprimer une exception de disponibilité.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'exception
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exception supprimée avec succès
 *       404:
 *         description: Exception non trouvée
 *       500:
 *         description: Erreur serveur
 */
// @ts-nocheck
import { NextRequest } from "next/server";
import { prisma } from "@/services/db";
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

        const exception = await prisma.availabilityException.findUnique({
            where: { id: params.id }
        });

        if (!exception) {
            return apiResponse({ status: 404, message: "Exception non trouvée" });
        }

        return apiResponse({ status: 200, message: "Exception récupérée", data: exception });
    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}

// UPDATE
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { date, dateStart, dateEnd, startTime, endTime } = body;

    const decodedUser = (req as any).user;

    const day = date ? new Date(date) : null;
    const start = dateStart ? new Date(dateStart) : null;
    const end = dateEnd ? new Date(dateEnd) : null;

    // CAS 1 : intervalle
    if (start && end) {

      // vérifier chevauchement avec autre intervalle
      const intervalExist = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          id: { not: params.id },
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

      // vérifier jour précis dans cet intervalle
      const dayInside = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          id: { not: params.id },
          date: {
            gte: start,
            lte: end
          }
        }
      });

      if (dayInside) {
        return apiResponse({
          status: 400,
          message: "Un jour précis existe déjà dans cet intervalle"
        });
      }

    }

    // CAS 2 : jour précis
    if (day && startTime && endTime) {

      // vérifier si un intervalle couvre ce jour
      const intervalCover = await prisma.availabilityException.findFirst({
        where: {
          ownerId: decodedUser.id,
          id: { not: params.id },
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
          id: { not: params.id },
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

    // Conversion des dates
    const dataToUpdate: any = {
      ...body,
      date: date ? day : undefined,
      dateStart: dateStart ? start : undefined,
      dateEnd: dateEnd ? end : undefined
    };

    const updated = await prisma.availabilityException.update({
      where: { id: params.id },
      data: dataToUpdate
    });

    return apiResponse({
      status: 200,
      message: "Exception mise à jour",
      data: updated
    });

  } catch (error: any) {
    console.log(error.message);
    return apiResponse({
      status: 500,
      message: error.message
    });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        await prisma.availabilityException.delete({
            where: { id: params.id }
        });

        return apiResponse({ status: 200, message: "Exception supprimée" });
    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}
export const dynamic = 'force-dynamic';

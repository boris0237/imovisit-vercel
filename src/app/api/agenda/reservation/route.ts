import { prisma } from "@/service/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { propertyId, date, startTime, endTime } = body;

    if (!propertyId || !date || !startTime || !endTime) {
      return apiResponse({ status: 400, message: "Champs obligatoires manquants" });
    }

    const decodedUser = (req as any).user;

    // Vérifier si déjà réservé
    const existing = await prisma.reservation.findFirst({
      where: {
        propertyId,
        date: new Date(date),
        startTime,
        endTime
      }
    });

    if (existing) {
      return apiResponse({ status: 400, message: "Créneau déjà réservé" });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return apiResponse({ status: 404, message: "Bien introuvable" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        propertyId,
        ownerId: property.userId,
        clientId: decodedUser.id,
        date: new Date(date),
        startTime,
        endTime,
        status: "pending"
      }
    });

    return apiResponse({
      status: 201,
      message: "Réservation créée",
      data: reservation
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}
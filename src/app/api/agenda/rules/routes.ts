// Créer une règle de disponibilité

import { prisma } from "@/service/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

export async function POST(req: NextRequest) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const body = await req.json();

        const {
            propertyId,
            recurrenceType,
            dayOfWeek,
            dayOfMonth,
            startTime,
            endTime
        } = body;

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



// Voir les créneaux disponibles

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const propertyId = searchParams.get("propertyId");
        const date = searchParams.get("date");

        if (!propertyId || !date) {
            return apiResponse({ status: 400, message: "Paramètres manquants" });
        }

        const targetDate = new Date(date);
        const day = targetDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

        // 1️⃣ Règles
        const rules = await prisma.availabilityRule.findMany({
            where: {
                propertyId,
                recurrenceType: "weekly",
                dayOfWeek: day as any
            }
        });

        // 2️⃣ Exceptions
        const exceptions = await prisma.availabilityException.findMany({
            where: {
                propertyId,
                date: targetDate
            }
        });

        // 3️⃣ Réservations
        const reservations = await prisma.reservation.findMany({
            where: {
                propertyId,
                date: targetDate
            }
        });

        return apiResponse({
            status: 200,
            message: "Données récupérées",
            data: { rules, exceptions, reservations }
        });

    } catch (err: any) {
        return apiResponse({ status: 500, message: err.message });
    }
}
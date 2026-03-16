import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

// convertit "HH:mm" → minutes
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// convertit minutes → "HH:mm"
function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// génère créneaux de 30 minutes
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
    const dayOfWeek = targetDate.getDay();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ récupérer le bien
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return apiResponse({
        status: 404,
        message: "Bien introuvable",
      });
    }

    const ownerId = property.userId;

    // 2️⃣ règles de disponibilité du propriétaire
    const rules = await prisma.availabilityRule.findMany({
      where: {
        ownerId,
        OR: [
          { date: { gte: startOfDay, lte: endOfDay } },
          { dayOfWeek },
        ],
      },
    });

    let slots: string[] = [];

    for (const rule of rules) {
      slots.push(...generateSlots(rule.startTime, rule.endTime));
    }

    // supprimer doublons
    slots = Array.from(new Set(slots));

    // 3️⃣ exceptions (jours bloqués)
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

    let exceptionSlots: string[] = [];

    for (const e of exceptions) {
      // journée entière bloquée
      if (!e.startTime && !e.endTime) {
        slots = [];
        break;
      }

      // blocage partiel
      if (e.startTime && e.endTime) {
        exceptionSlots.push(...generateSlots(e.startTime, e.endTime));
      }
    }

    // 4️⃣ réservations existantes
    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId,
        date: { gte: startOfDay, lte: endOfDay },
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    let reservedSlots: string[] = [];

    for (const r of reservations) {
      reservedSlots.push(...generateSlots(r.startTime, r.endTime));
    }

    // 5️⃣ filtrer créneaux indisponibles
    slots = slots.filter(
      (s) => !reservedSlots.includes(s) && !exceptionSlots.includes(s)
    );

    // 6️⃣ supprimer heures passées si aujourd'hui
    const today = new Date().toISOString().split("T")[0];

    if (today === date) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      slots = slots.filter((s) => toMinutes(s) > currentMinutes);
    }

    // 7️⃣ tri chronologique
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
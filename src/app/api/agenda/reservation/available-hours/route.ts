import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const dateStr = searchParams.get("date");

    if (!propertyId || !dateStr) {
      return apiResponse({
        status: 400,
        message: "propertyId et date obligatoires",
      });
    }

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      return apiResponse({ status: 400, message: "Date invalide" });
    }

    const dayOfWeek = targetDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const dayOfMonth = targetDate.getDate();

    // 1️⃣ Récupérer les règles correspondant EXACTEMENT au jour
    const rules = await prisma.availabilityRule.findMany({
      where: {
        propertyId,
        OR: [
          {
            recurrenceType: "weekly",
            dayOfWeek: dayOfWeek as any,
          },
          {
            recurrenceType: "monthly",
            dayOfMonth: dayOfMonth,
          },
        ],
      },
    });

    if (!rules.length) {
      return apiResponse({
        status: 200,
        message: "Aucune disponibilité",
        data: { date: dateStr, availableHours: [] },
      });
    }

    // 2️⃣ Générer les créneaux de 30min
    const allSlotsSet = new Set<string>();

    for (const rule of rules) {
      const [hStart, mStart] = rule.startTime.split(":").map(Number);
      const [hEnd, mEnd] = rule.endTime.split(":").map(Number);

      // sécurité
      if (hStart > hEnd || (hStart === hEnd && mStart >= mEnd)) continue;

      let slot = new Date(targetDate);
      slot.setHours(hStart, mStart, 0, 0);

      const end = new Date(targetDate);
      end.setHours(hEnd, mEnd, 0, 0);

      while (slot < end) {
        const timeStr = slot.toTimeString().slice(0, 5);
        allSlotsSet.add(timeStr);
        slot = new Date(slot.getTime() + 30 * 60 * 1000);
      }
    }

    let availableHours = Array.from(allSlotsSet);

    // 3️⃣ Supprimer exceptions
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        propertyId,
        OR: [
          { date: targetDate },
          { dayOfWeek: dayOfWeek as any },
          { dayOfMonth },
        ],
      },
    });

    for (const ex of exceptions) {
      if (ex.startTime && ex.endTime) {
        availableHours = availableHours.filter(
          (slot) => !(slot >= ex.startTime! && slot < ex.endTime!)
        );
      }
    }

    // 4️⃣ Supprimer réservations existantes
    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId,
        date: targetDate,
        status: { not: "cancelled" },
      },
    });

    const reservedSlots = reservations.map((r) => r.startTime);

    availableHours = availableHours.filter(
      (slot) => !reservedSlots.includes(slot)
    );

    // 5️⃣ Supprimer créneaux passés si aujourd’hui
    const now = new Date();
    if (targetDate.toDateString() === now.toDateString()) {
      availableHours = availableHours.filter((slot) => {
        const [h, m] = slot.split(":").map(Number);
        return (
          now.getHours() < h ||
          (now.getHours() === h && now.getMinutes() < m)
        );
      });
    }

    // 6️⃣ Trier
    availableHours.sort((a, b) => a.localeCompare(b));

    return apiResponse({
      status: 200,
      message: "Heures disponibles",
      data: {
        date: dateStr,
        availableHours,
      },
    });
  } catch (err: any) {
    return apiResponse({
      status: 500,
      message: err.message,
    });
  }
}
/**
 * @swagger
 * /api/visits/available-hours:
 *   get:
 *     tags:
 *       - Agenda
 *     summary: Récupérer les heures disponibles pour visiter un bien
 *     description: Retourne les horaires disponibles d'une journée (pas de 30 minutes)
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Liste des heures disponibles
 */

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

function generateSlots(start: string, end: string) {
  const slots: string[] = [];

  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let current = h * 60 + m;
  const endMinutes = endH * 60 + endM;

  while (current + 30 <= endMinutes) {
    const hour = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");

    const minute = (current % 60).toString().padStart(2, "0");

    slots.push(`${hour}:${minute}`);

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
        message: "propertyId et date requis"
      });
    }

    const targetDate = new Date(date);

    const dayOfWeek = targetDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const dayOfMonth = targetDate.getDate();

    // règles de disponibilité
    const rules = await prisma.availabilityRule.findMany({
      where: {
        propertyId,
        OR: [
          { recurrenceType: "weekly", dayOfWeek: dayOfWeek as any },
          { recurrenceType: "monthly", dayOfMonth }
        ]
      }
    });

    let slots: string[] = [];

    for (const rule of rules) {
      const ruleSlots = generateSlots(rule.startTime, rule.endTime);
      slots.push(...ruleSlots);
    }

    // réservations existantes
    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId,
        date: targetDate
      }
    });

    const reserved = reservations.map((r) => r.startTime);

    // exceptions
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        propertyId,
        OR: [
          { date: targetDate },
          { dayOfWeek: dayOfWeek as any },
          { dayOfMonth }
        ]
      }
    });

    const exceptionSlots: string[] = [];

    exceptions.forEach((e) => {
      if (e.startTime && e.endTime) {
        exceptionSlots.push(...generateSlots(e.startTime, e.endTime));
      }
    });

    // supprimer réservés + exceptions
    slots = slots.filter(
      (s) => !reserved.includes(s) && !exceptionSlots.includes(s)
    );

    // supprimer heures passées si aujourd'hui
    const today = new Date().toISOString().split("T")[0];

    if (date === today) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      slots = slots.filter((slot) => {
        const [h, m] = slot.split(":").map(Number);
        const minutes = h * 60 + m;
        return minutes > currentMinutes;
      });
    }

    slots.sort();

    return apiResponse({
      status: 200,
      data: {
        date,
        availableHours: slots
      }
    });

  } catch (err: any) {
    return apiResponse({
      status: 500,
      message: err.message
    });
  }
}
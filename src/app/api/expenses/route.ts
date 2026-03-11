/**
 * @swagger
 * /api/expenses:
 *   post:
 *     tags:
 *       - Depense
 *     summary: Créer une dépense
 *     description: Permet d’enregistrer une nouvelle dépense liée à un bien.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetId
 *               - type
 *               - amount
 *               - currency
 *               - date
 *             properties:
 *               assetId:
 *                 type: string
 *                 example: 65f9e3f47b1a5c8f23456789
 *               type:
 *                 type: string
 *                 example: maintenance
 *               amount:
 *                 type: number
 *                 example: 50000
 *               currency:
 *                 type: string
 *                 example: XAF
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-09
 *               description:
 *                 type: string
 *                 example: Réparation du moteur
 *               vendor:
 *                 type: string
 *                 example: Garage Central
 *     responses:
 *       201:
 *         description: Dépense créée avec succès
 *       400:
 *         description: Champs obligatoires manquants
 *       500:
 *         description: Erreur serveur
 */

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

// creer une depense
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      assetId,
      type,
      amount,
      currency,
      date,
      description,
      vendor
    } = body;

    if (!assetId || !type || !amount || !currency || !date) {
      return apiResponse({
        status: 400,
        message: "Champs obligatoires manquants"
      });
    }

    const expense = await prisma.expense.create({
      data: {
        assetId,
        type,
        amount,
        currency,
        date: new Date(date),
        description,
        vendor
      }
    });

    return apiResponse({
      status: 201,
      message: "Dépense créée",
      data: expense
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     tags:
 *       - Depense
 *     summary: Lister toutes les dépenses
 *     description: Retourne la liste des dépenses avec possibilité de filtrer par date.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début du filtre
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin du filtre
 *     responses:
 *       200:
 *         description: Liste des dépenses récupérée
 *       500:
 *         description: Erreur serveur
 */

//voir all et filtrer depenses par intervalle de date
export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        where.date.gte = new Date(startDate);
      }

      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    });

    return apiResponse({
      status: 200,
      message: "Liste des dépenses",
      data: expenses
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
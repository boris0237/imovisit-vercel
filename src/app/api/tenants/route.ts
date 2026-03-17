/**
 * @swagger
 * /api/tenants:
 *   post:
 *     tags:
 *       - Locataire
 *     summary: Créer un locataire
 *     description: Permet d’enregistrer un locataire associé à un bien immobilier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - assetId
 *               - startDate
 *               - endDate
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *               email:
 *                 type: string
 *                 example: jean@email.com
 *               phone:
 *                 type: string
 *                 example: +237600000000
 *               assetId:
 *                 type: string
 *                 example: 65f9e3f47b1a5c8f23456789
 *               address:
 *                 type: string
 *                 example: Yaoundé
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *     responses:
 *       201:
 *         description: Locataire créé
 *       400:
 *         description: Champs manquants
 *       500:
 *         description: Erreur serveur
 */

import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

// Creer un locataire
export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req as any)
    if (authError) return authError
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      assetId,
      address,
      startDate,
      endDate
    } = body;

    if (!firstName || !lastName || !email || !phone || !assetId || !startDate || !endDate) {
      return apiResponse({
        status: 400,
        message: "Champs obligatoires manquants"
      });
    }

    const tenant = await prisma.tenant.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        assetId,
        address,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    return apiResponse({
      status: 201,
      message: "Locataire créé",
      data: tenant
    });

  } catch (error: any) {
    return apiResponse({
      status: 500,
      message: error.message
    });
  }
}


/**
 * @swagger
 * /api/tenants:
 *   get:
 *     tags:
 *       - Locataire
 *     summary: Lister les locataires
 *     description: Permet de récupérer tous les locataires avec filtres.
 *     parameters:
 *       - in: query
 *         name: assetId
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Liste des locataires
 */

// Lister et filtrer les locataires
export async function GET(req: NextRequest) {
  try {
    const authError = authMiddleware(req as any)
    if (authError) return authError
    const { searchParams } = new URL(req.url);

    const assetId = searchParams.get("assetId");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (assetId) {
      where.assetId = assetId;
    }

    if (email) {
      where.email = email;
    }

    if (name) {
      where.OR = [
        { firstName: { contains: name, mode: "insensitive" } },
        { lastName: { contains: name, mode: "insensitive" } }
      ];
    }

    // filtre date début
    if (startDate) {
      where.startDate = {
        gte: new Date(startDate)
      };
    }

    // filtre date fin
    if (endDate) {
      where.endDate = {
        lte: new Date(endDate)
      };
    }

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    });

    return apiResponse({
      status: 200,
      message: "Liste des locataires",
      data: tenants
    });

  } catch (error: any) {
    return apiResponse({
      status: 500,
      message: error.message
    });
  }
}
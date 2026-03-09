import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

/**
 * @swagger
 * /api/cities:
 *   post:
 *     tags:
 *       - Geolocalisation
 *     summary: Créer une ville
 *     description: Permet d’ajouter une nouvelle ville associée à un pays.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - countryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Yaoundé
 *               countryId:
 *                 type: string
 *                 example: 65fa12ab34cd56ef78901234
 *     responses:
 *       201:
 *         description: Ville créée avec succès
 *       400:
 *         description: Ville déjà existante ou champs manquants
 *       500:
 *         description: Erreur serveur
 */

// Créer une ville
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, countryId } = body;

    if (!name || !countryId) {
      return apiResponse({ status: 400, message: "Nom et countryId requis" });
    }

    //Vérifier doublon
    const existing = await prisma.city.findFirst({
      where: { name, countryId }
    });
    if (existing) {
      return apiResponse({ status: 400, message: "Ville déjà existante pour ce pays" });
    }

    const city = await prisma.city.create({
      data: { name, countryId }
    });

    return apiResponse({ status: 201, message: "Ville créée", data: city });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/cities:
 *   get:
 *     tags:
 *       - Geolocalisation
 *     summary: Lister les villes
 *     description: Retourne la liste des villes avec filtres et pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: Douala
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *         example: 65fa12ab34cd56ef78901234
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: Liste des villes récupérée
 *       500:
 *         description: Erreur serveur
 */

//filter les villes "pays", "recherche"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const countryId = searchParams.get("countryId");
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (countryId) where.countryId = countryId;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (isActive !== null) where.isActive = isActive === "true";

    const [data, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.city.count({ where }),
    ]);

    return apiResponse({
      status: 200,
      message: "Liste des villes",
      data: {
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      }
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
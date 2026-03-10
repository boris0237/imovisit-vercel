import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

/**
 * @swagger
 * /api/districts:
 *   post:
 *     tags:
 *       - Geolocalisation
 *     summary: Créer un quartier
 *     description: Permet d’ajouter un nouveau quartier associé à une ville.
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
 *               - cityId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bonapriso
 *               cityId:
 *                 type: string
 *                 example: 65fa12ab34cd56ef78901234
 *     responses:
 *       201:
 *         description: Quartier créé avec succès
 *       400:
 *         description: Quartier déjà existant ou champs manquants
 *       404:
 *         description: Ville introuvable
 *       500:
 *         description: Erreur serveur
 */

// CREATE DISTRICT
export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const { name, cityId } = body;

    if (!name || !cityId) {
      return apiResponse({ status: 400, message: "Nom et cityId requis" });
    }

    // Vérifier si la ville existe
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      return apiResponse({ status: 404, message: "Ville introuvable" });
    }

    // Vérifier doublon
    const existing = await prisma.district.findFirst({
      where: { name, cityId }
    });

    if (existing) {
      return apiResponse({
        status: 400,
        message: "Quartier déjà existant pour cette ville"
      });
    }

    const district = await prisma.district.create({
      data: { name, cityId }
    });

    return apiResponse({
      status: 201,
      message: "Quartier créé",
      data: district
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/districts:
 *   get:
 *     tags:
 *       - Geolocalisation
 *     summary: Lister les quartiers
 *     description: Retourne la liste des quartiers avec filtres par ville, pays et pagination.
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
 *         example: Bonapriso
 *       - in: query
 *         name: cityId
 *         schema:
 *           type: string
 *         example: 65fa12ab34cd56ef78901234
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *         example: 65fa12ab34cd56ef78905678
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: Liste des quartiers récupérée
 *       500:
 *         description: Erreur serveur
 */

// LIST DISTRICTS

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const cityId = searchParams.get("cityId");
    const countryId = searchParams.get("countryId");
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (cityId) where.cityId = cityId;

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // filtre par country via relation city
    if (countryId) {
      where.city = {
        countryId
      };
    }

    const [data, total] = await Promise.all([
      prisma.district.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          city: {
            include: {
              country: true
            }
          }
        }
      }),
      prisma.district.count({ where })
    ]);

    return apiResponse({
      status: 200,
      message: "Liste des quartiers",
      data: {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
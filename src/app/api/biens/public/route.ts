import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/biens/public:
 *   get:
 *     tags:
 *       - Biens
 *     summary: Recherche publique des biens
 *     description: Retourne les biens disponibles avec filtres et pagination (sans authentification).
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: offerType
 *         schema:
 *           type: string
 *       - in: query
 *         name: rooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *       500:
 *         description: Erreur serveur
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const type = searchParams.get("type");
    const offerType = searchParams.get("offerType");
    const rooms = searchParams.get("rooms");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const filters: any = { isAvailable: true };

    if (city) filters.city = city;
    if (neighborhood) filters.neighborhood = neighborhood;
    if (type) filters.type = type;
    if (offerType) filters.offerType = offerType;
    if (rooms) filters.rooms = parseInt(rooms);

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where: filters }),
    ]);

    return apiResponse({
      status: 200,
      message: "Résultats de recherche",
      data: { properties, total, page, limit },
    });
  } catch (error: any) {
    return apiResponse({
      status: 500,
      message: error.message || "Erreur lors de la recherche",
    });
  }
}

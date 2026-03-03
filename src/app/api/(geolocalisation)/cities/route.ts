import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

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
import { apiResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { prisma } from "@/services/db";

// creer un pays
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
      return apiResponse({ status: 400, message: "Nom et code requis" });
    }

    const existing = await prisma.country.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { code: { equals: code, mode: "insensitive" } }
        ]
      }
    });

    if (existing) {
      return apiResponse({ status: 400, message: "Pays déjà existant" });
    }

    const country = await prisma.country.create({
      data: { name, code }
    });

    return apiResponse({ status: 201, message: "Pays créé", data: country });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}

//get pays et recherche par "search" et "isActive"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const [data, total] = await Promise.all([
      prisma.country.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.country.count({ where })
    ]);

    return apiResponse({
      status: 200,
      message: "Liste des pays",
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
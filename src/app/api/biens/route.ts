import { prisma } from "@/service/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handlePropertyFormData, PropertyFormDataResult } from "@/utils/handle-property-formData";
import { roleMiddleware } from "@/middlewares/role-middleware";
import { UserRole } from "@prisma/client";

// -- Creer les Bien --
export async function POST(req: NextRequest) {
  try {
    // Vérification de auth
    const authError = authMiddleware(req);
    if (authError) return authError;
    const roleError = roleMiddleware(
      [UserRole.admin, UserRole.agency, UserRole.agent, UserRole.owner, UserRole.property_manager, UserRole.prospector]
    )(req as any)
    if (roleError) return roleError


    // Récupération complète depuis la DB
    const decodedUser = (req as any).user;
    const user = await prisma.user.findUnique({
      where: { id: decodedUser.id },
      select: {
        id: true,
        name: true,
        companyName: true,
        companyLogo: true,
        accountStatus: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      return apiResponse({ status: 404, message: "Utilisateur non trouvé" });
    }

    // Récupération et traitement du FormData
    const formData = await req.formData();
    const data: PropertyFormDataResult = await handlePropertyFormData(formData);

    // Champs obligatoires
    const requiredFields = ["title", "description", "price", "priceType", "type", "offerType", "city", "neighborhood", "images"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return apiResponse({ status: 400, message: `Champ obligatoire manquant: ${field}` });
      }
    }


    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        type: data.type,
        offerType: data.offerType,
        city: data.city,
        neighborhood: data.neighborhood || "",
        address: data.address || "",
        surface: data.surface || 0,
        rooms: data.rooms || 0,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        visitType: data.visitType,
        visitFee: data.visitFee,
        isAvailable: data.isAvailable === 'true' || data.isAvailable === true,
        images: data.images,
        amenities: data.amenities || [],
        docTitreFoncier: data.docTitreFoncier,

        // Infos utilisateur
        userId: user.id,
        userName: user.name,
        userCompanyName: user.companyName,
        userCompanyLogo: user.companyLogo,
        userVerified: user.accountStatus,
        userAvatar: user.avatar,
      },
    });

    return apiResponse({ status: 201, message: "Bien créé avec succès", data: property });
  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message || "Erreur lors de la création du bien" });
  }
}

// -- Voir Bien --
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filtres dynamiques
    const filters: any = {};
    if (url.searchParams.get("type")) filters.type = url.searchParams.get("type");
    if (url.searchParams.get("city")) filters.city = url.searchParams.get("city");
    if (url.searchParams.get("offerType")) filters.offerType = url.searchParams.get("offerType");

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
      message: "Liste des biens",
      data: { properties, page, limit, total },
    });
  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message || "Erreur lors de la récupération des biens" });
  }
}

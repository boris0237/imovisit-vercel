/**
 * @swagger
 * /api/biens:
 *   get:
 *     tags:
 *       - Biens
 *     summary: Recherche et filtrage des biens
 *     description: |
 *       Permet de filtrer les biens immobiliers avec plusieurs critères dynamiques.
 *       
 *       🔐 Gestion des accès :
 *       - Un utilisateur normal ne voit QUE ses propres biens
 *       - Un admin peut voir tous les biens
 *       - Un admin peut filtrer par userId pour voir les biens d’un utilisateur spécifique
 *       
 *       🔎 Filtres disponibles :
 *       - recherche texte (titre + description)
 *       - localisation (ville, quartier)
 *       - type de bien et type d’offre
 *       - nombre de pièces
 *       - disponibilité
 *       - plage de prix
 *       - utilisateur propriétaire (admin uniquement)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans le titre et la description
 *         example: villa
 *
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         example: Yaounde
 *
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         example: Bastos
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STUDIO, VILLA]
 *         example: VILLA
 *
 *       - in: query
 *         name: offerType
 *         schema:
 *           type: string
 *           enum: [VENTE, LOCATION, FURNISHED]
 *         example: VENTE
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, unavailable]
 *         description: Filtrer selon disponibilité
 *         example: available
 *
 *       - in: query
 *         name: rooms
 *         schema:
 *           type: integer
 *         example: 4
 *
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         example: 1000000
 *
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         example: 5000000
 *
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: |
 *           Filtrer les biens par propriétaire.
 *           ⚠️ Accessible uniquement aux administrateurs.
 *         example: "65f1a2c4e12ab34d56789abc"
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             examples:
 *               success:
 *                 summary: Résultat avec données
 *                 value:
 *                   properties: []
 *                   total: 25
 *                   page: 1
 *                   limit: 10
 *
 *       403:
 *         description: Accès refusé (user essaie d'accéder aux biens d’un autre)
 *         content:
 *           application/json:
 *             example:
 *               status: 403
 *               message: "Accès refusé"
 *
 *       401:
 *         description: Non autorisé
 *
 *       500:
 *         description: Erreur serveur
 */


import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handlePropertyFormData, PropertyFormDataResult } from "@/utils/handle-property-formData";
import { roleMiddleware } from "@/middlewares/role-middleware";
import { USER_ROLE_ENUM } from "@/types/enums";


// -- Creer les Bien --
export async function POST(req: NextRequest) {
  try {
    // Vérification de auth
    const authError = authMiddleware(req);
    if (authError) return authError;
    const roleError = roleMiddleware(
      [USER_ROLE_ENUM.admin, USER_ROLE_ENUM.agency, USER_ROLE_ENUM.agent, USER_ROLE_ENUM.owner, USER_ROLE_ENUM.property_manager, USER_ROLE_ENUM.prospector]
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
        commission: data.commission,
        depositMonths: data.depositMonths,
        advanceMonths: data.advanceMonths,
        isAvailable: data.isAvailable === undefined ? true : data.isAvailable === 'true' || data.isAvailable === true,
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


// -- Voir Bien && Filtre Biens --
export async function GET(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const currentUser = (req as any).user;

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filtres dynamiques
    const filters: any = {};

    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const type = searchParams.get("type");
    const offerType = searchParams.get("offerType");
    const status = searchParams.get("status");
    const rooms = searchParams.get("rooms");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const userIdQuery = searchParams.get("userId");

    if (city) filters.city = city;
    if (neighborhood) filters.neighborhood = neighborhood;
    if (type) filters.type = type;
    if (offerType) filters.offerType = offerType;
    if (rooms) filters.rooms = parseInt(rooms);

    if (status === "available") filters.isAvailable = true;
    if (status === "unavailable") filters.isAvailable = false;

    // Prix
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

    // Recherche texte
    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // LOGIQUE USER / ADMIN

    if (currentUser?.role === USER_ROLE_ENUM.admin) {
      // admin peut filtrer par n'importe quel user
      if (userIdQuery) {
        filters.userId = userIdQuery;
      }
    } else {
      // user normal :
      if (userIdQuery && userIdQuery !== currentUser.id) {
        return apiResponse({
          status: 403,
          message: "Accès refusé",
        });
      }

      // sinon il voit seulement ses biens
      filters.userId = currentUser.id;
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

  } catch (err: any) {
    console.log(err.message);
    return apiResponse({
      status: 500,
      message: err.message || "Erreur lors de la recherche",
    });
  }
}

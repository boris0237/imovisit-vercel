/**
 * @swagger
 * /api/biens:
 *   post:
 *     tags:
 *       - Biens
 *     summary: Création d'un nouveau bien immobilier
 *     description: Permet à un utilisateur authentifié (admin, agent, owner...) de créer un bien immobilier.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - priceType
 *               - type
 *               - offerType
 *               - city
 *               - neighborhood
 *               - images
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Villa moderne à Bastos"
 *               description:
 *                 type: string
 *                 example: "Très belle villa avec piscine"
 *               price:
 *                 type: number
 *                 example: 250000000
 *               priceType:
 *                 type: string
 *                 enum: [VENTE, LOCATION_MENSUELLE, LOCATION_JOURNALIERE]
 *                 example: VENTE
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, STUDIO, VILLA]
 *                 example: VILLA
 *               offerType:
 *                 type: string
 *                 enum: [VENTE, LOCATION, FURNISHED]
 *                 example: VENTE
 *               city:
 *                 type: string
 *                 example: "Yaounde"
 *               neighborhood:
 *                 type: string
 *                 example: "Bastos"
 *               rooms:
 *                 type: integer
 *                 example: 4
 *               bedrooms:
 *                 type: integer
 *                 example: 3
 *               bathrooms:
 *                 type: integer
 *                 example: 2
 *               surface:
 *                 type: number
 *                 example: 250
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Bien créé avec succès
 *       400:
 *         description: Champ obligatoire manquant
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */


/**
 * @swagger
 * /api/biens:
 *   get:
 *     tags:
 *       - Biens
 *     summary: Recherche et filtrage des biens
 *     description: Permet de filtrer les biens par ville, quartier, type, offre, prix, nombre de pièces et recherche texte.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: villa
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         example: Yaounde
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         example: Bastos
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STUDIO, VILLA]
 *         example: VILLA
 *       - in: query
 *         name: offerType
 *         schema:
 *           type: string
 *           enum: [VENTE, LOCATION, FURNISHED]
 *         example: VENTE
 *       - in: query
 *         name: rooms
 *         schema:
 *           type: integer
 *         example: 4
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         example: 1000000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         example: 5000000
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
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */


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


// -- Voir Bien && Filtre Biens --
export async function GET(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

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
    const rooms = searchParams.get("rooms");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (city) filters.city = city;
    if (neighborhood) filters.neighborhood = neighborhood;
    if (type) filters.type = type;
    if (offerType) filters.offerType = offerType;
    if (rooms) filters.rooms = parseInt(rooms);

    // Filtre prix
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

    // Recherche texte (titre + description)
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

  } catch (err: any) {
    return apiResponse({
      status: 500,
      message: err.message || "Erreur lors de la recherche",
    });
  }
}
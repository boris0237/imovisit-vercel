/**
 * @swagger
 * /api/biens/stats:
 *   get:
 *     tags:
 *       - Biens
 *     summary: Statistiques globales des biens d'un utilisateur
 *     description: Permet à un utilisateur authentifié de récupérer les statistiques de tous les biens qu'il a créés (nombre de biens, vues, favoris, réservations, disponibilité, etc.).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Statistiques globales utilisateur"
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: object
 *                       properties:
 *                         totalProperties:
 *                           type: integer
 *                           example: 4
 *                         totalRent:
 *                           type: integer
 *                           example: 2
 *                         totalSale:
 *                           type: integer
 *                           example: 1
 *                         totalFurnished:
 *                           type: integer
 *                           example: 1
 *                         totalAvailable:
 *                           type: integer
 *                           example: 3
 *                         totalUnavailable:
 *                           type: integer
 *                           example: 1
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalViews:
 *                           type: integer
 *                           example: 469
 *                         totalFavorites:
 *                           type: integer
 *                           example: 44
 *                     reservations:
 *                       type: object
 *                       properties:
 *                         totalReservations:
 *                           type: integer
 *                           example: 9
 *                         confirmed:
 *                           type: integer
 *                           example: 3
 *                         pending:
 *                           type: integer
 *                           example: 5
 *                         cancelled:
 *                           type: integer
 *                           example: 1
 *                         conversionRate:
 *                           type: number
 *                           format: float
 *                           example: 1.92
 *       401:
 *         description: Utilisateur non authentifié ou token invalide
 *       500:
 *         description: Erreur serveur
 */


import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

export async function GET(req: NextRequest) {
  try {
    // Vérification auth
    const authError = authMiddleware(req);
    if (authError) return authError;

    const currentUserId = (req as any).user?.id;

    // Récupérer tous les biens de l'utilisateur
    const properties = await prisma.property.findMany({
      where: { userId: currentUserId }
    });

    if (properties.length === 0) {
      return apiResponse({ status: 200, message: "Aucun bien trouvé", data: {} });
    }

    const propertyIds = properties.map(p => p.id);

    // Stats biens
    const totalProperties = properties.length;
    const totalRent = properties.filter(p => p.offerType === "rent").length;
    const totalSale = properties.filter(p => p.offerType === "sale").length;
    const totalFurnished = properties.filter(p => p.offerType === "furnished").length;
    const totalAvailable = properties.filter(p => p.isAvailable).length;
    const totalUnavailable = properties.filter(p => !p.isAvailable).length;

    // Vues
    const totalViews = properties.reduce((sum, p) => sum + p.views, 0);

    // Favoris
    const totalFavorites = await prisma.favorite.count({ where: { propertyId: { in: propertyIds } } });

    // Réservations
    const [totalReservations, confirmed, pending, cancelled] = await Promise.all([
      prisma.reservation.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.reservation.count({ where: { propertyId: { in: propertyIds }, status: "confirmed" } }),
      prisma.reservation.count({ where: { propertyId: { in: propertyIds }, status: "pending" } }),
      prisma.reservation.count({ where: { propertyId: { in: propertyIds }, status: "cancelled" } })
    ]);

    const conversionRate = totalViews > 0 ? (totalReservations / totalViews) * 100 : 0;

    return apiResponse({
      status: 200,
      message: "Statistiques globales utilisateur",
      data: {
        properties: { totalProperties, totalRent, totalSale, totalFurnished, totalAvailable, totalUnavailable },
        overview: { totalViews, totalFavorites },
        reservations: { totalReservations, confirmed, pending, cancelled, conversionRate: Number(conversionRate.toFixed(2)) }
      }
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
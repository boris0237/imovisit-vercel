import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { roleMiddleware } from "@/middlewares/role-middleware";
import { USER_ROLE_ENUM } from "@/types/enums";


export async function GET(req: NextRequest) {
    try {
        // Vérification
        const authError = authMiddleware(req);
        if (authError) return authError;
        const roleError = roleMiddleware([USER_ROLE_ENUM.admin])(req as any)
        if (roleError) return roleError

        // Tous les biens
        const properties = await prisma.property.findMany();
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
            message: "Statistiques globales admin",
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
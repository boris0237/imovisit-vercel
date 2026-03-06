import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

// Détail ville
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const city = await prisma.city.findUnique({
            where: { id: params.id },
            include: { districts: true } // inclure les quartiers
        });

        if (!city) {
            return apiResponse({ status: 404, message: "Ville introuvable" });
        }

        return apiResponse({ status: 200, data: city });
    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}

// Mettre à jour une ville
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const body = await req.json();
        const { name, countryId, isActive } = body;

        const city = await prisma.city.findUnique({ where: { id: params.id } });
        if (!city) return apiResponse({ status: 404, message: "Ville introuvable" });

        //Vérifier doublon
        if (name && countryId) {
            const existing = await prisma.city.findFirst({
                where: {
                    name,
                    countryId,
                    NOT: { id: params.id }
                }
            });
            if (existing) return apiResponse({ status: 400, message: "Ville déjà existante pour ce pays" });
        }

        const updatedCity = await prisma.city.update({
            where: { id: params.id },
            data: { name, countryId, isActive }
        });

        return apiResponse({ status: 200, message: "Ville mise à jour", data: updatedCity });

    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        //Vérifier si la ville existe
        const city = await prisma.city.findUnique({ where: { id: params.id } });
        if (!city) {
            return apiResponse({ status: 404, message: "Ville introuvable" });
        }

        //Suppression physique
        await prisma.city.delete({ where: { id: params.id } });

        return apiResponse({ status: 200, message: "Ville supprimée avec succès" });

    } catch (error: any) {
        return apiResponse({ status: 500, message: error.message });
    }
}
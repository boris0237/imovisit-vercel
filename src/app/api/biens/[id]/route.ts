import { NextRequest } from "next/server";
import { prisma } from "@/service/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handlePropertyFormData } from "@/utils/handle-property-formData";
import { UserRole } from "@prisma/client";

// Voir un Bien
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const property = await prisma.property.findUnique({
            where: { id },
        });

        if (!property) {
            return apiResponse({ status: 404, message: "Bien non trouvé" });
        }

        return apiResponse({ status: 200, message: "Détail du bien", data: property });
    } catch (err: any) {
        return apiResponse({ status: 500, message: err.message || "Erreur lors de la récupération du bien" });
    }
}



// -- Mettre à jour un Bien --
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const user = (req as any).user;
        const formData = await req.formData();
        const data = await handlePropertyFormData(formData);

        const property = await prisma.property.findUnique({ where: { id: params.id } });
        if (!property) return apiResponse({ status: 404, message: "Bien non trouvé" });

        // Seul le créateur ou admin peut modifier
        if (property.userId !== user.id && user.role !== UserRole.admin) {
            return apiResponse({ status: 403, message: "Non autorisé à modifier ce bien" });
        }

        const updatedProperty = await prisma.property.update({
            where: { id: params.id },
            data,
        });

        return apiResponse({ status: 200, message: "Bien mis à jour", data: updatedProperty });
    } catch (err: any) {
        return apiResponse({ status: 500, message: err.message || "Erreur lors de la mise à jour" });
    }
}

// -- Supprimer un Bien --
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;
    const property = await prisma.property.findUnique({ where: { id: params.id } });
    if (!property) return apiResponse({ status: 404, message: "Bien non trouvé" });

    // Seul le créateur ou admin peut supprimer
    if (property.userId !== user.id && user.role !== "admin") {
      return apiResponse({ status: 403, message: "Non autorisé à supprimer ce bien" });
    }

    // Suppression réelle
    const deletedProperty = await prisma.property.delete({
      where: { id: params.id },
    });

    return apiResponse({ status: 200, message: "Bien supprimé définitivement", data: deletedProperty });
  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message || "Erreur lors de la suppression" });
  }
}

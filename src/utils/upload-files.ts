import { prisma } from "@/service/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handleFormData } from "@/utils/handle-formData";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    // Vérification auth
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;

    // Récupérer FormData
    const formData = await req.formData();

    // Upload fichiers + récupérer champs texte
    const updateData = await handleFormData(formData);

    if (Object.keys(updateData).length === 0) {
      return apiResponse({
        status: 400,
        message: "Aucun champ fourni pour la mise à jour",
      });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return apiResponse({
      status: 200,
      message: "Profil mis à jour avec succès",
      data: userWithoutPassword,
    });

  } catch (err: any) {
    console.error(err);
    return apiResponse({
      status: 500,
      message: "Erreur lors de la mise à jour du profil",
      error: err.message || String(err),
    });
  }
}

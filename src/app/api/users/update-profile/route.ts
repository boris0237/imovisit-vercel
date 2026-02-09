/**
 * update chant user
 */
import { prisma } from "@/service/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  try {

    // Vérifie de auth
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;

    const { name, age, phone, city, country, profession } = await req.json();

    if (!name && !age && !phone && !city && !country && !profession) {
      return apiResponse({
        status: 400,
        message: "Aucun champ fourni pour la mise à jour",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ?? undefined,
        age: age ?? undefined,
        phone: phone ?? undefined,
        city: city ?? undefined,
        country: country ?? undefined,
        profession: profession ?? undefined,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return apiResponse({
      status: 200,
      message: "Profil mis à jour avec succès",
      data: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    return apiResponse({
      status: 500,
      message: "Erreur lors de la mise à jour du profil",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * change password
 */

import { prisma } from "@/service/db";
import bcrypt from "bcryptjs";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware"; 
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Vérifier auth
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;

    const { oldPassword, newPassword, confirmPassword } = await req.json();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return apiResponse({
        status: 400,
        message: "Tous les champs sont requis",
      });
    }

    if (newPassword !== confirmPassword) {
      return apiResponse({
        status: 400,
        message: "Les nouveaux mots de passe ne correspondent pas",
      });
    }

    // Vérifie si c'est compte local
    if (user.authProvider !== "local") {
      return apiResponse({
        status: 403,
        message: "Impossible de changer le mot de passe pour ce type de compte",
      });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return apiResponse({ status: 404, message: "Utilisateur non trouvé" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, dbUser.password!);
    if (!isOldPasswordValid) {
      return apiResponse({ status: 401, message: "Ancien mot de passe incorrect" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return apiResponse({
      status: 200,
      message: "Mot de passe changé avec succès !",
    });
  } catch (err) {
    console.error(err);
    return apiResponse({
      status: 500,
      message: "Erreur lors du changement de mot de passe",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

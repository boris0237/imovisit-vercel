/**
 * reset password
 */

import { prisma } from "@/service/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { apiResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { AuthProvider } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return apiResponse({
        status: 400,
        message: "Token manquant dans l'URL",
      });
    }

    const { newPassword, confirmPassword } = await req.json();

    if (!newPassword || !confirmPassword) {
      return apiResponse({
        status: 400,
        message: "Nouveau mot de passe et confirmation requis",
      });
    }

    if (newPassword !== confirmPassword) {
      return apiResponse({
        status: 400,
        message: "Les mots de passe ne correspondent pas",
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return apiResponse({
        status: 404,
        message: "Utilisateur non trouvé",
      });
    }

    // Si compte Google impossible de modifier le mot de passe
    if (user.authProvider !== AuthProvider.local) {
      return apiResponse({
        status: 403,
        message:
          "Impossible de modifier le mot de passe pour un compte Google",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return apiResponse({
      status: 200,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (err) {
    console.error(err);
    return apiResponse({
      status: 400,
      message: "Lien invalide ou expiré",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

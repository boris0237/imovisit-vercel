/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Réinitialisation du mot de passe
 *     description: Permet de réinitialiser le mot de passe d'un utilisateur via un lien envoyé par email contenant un token JWT valide.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token JWT reçu par email pour valider la réinitialisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "azerty123"
 *               confirmPassword:
 *                 type: string
 *                 example: "azerty123"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               message: "Mot de passe réinitialisé avec succès"
 *               data: null
 *               error: null
 *       400:
 *         description: Token manquant, mot de passe invalide ou lien expiré
 *       403:
 *         description: Impossible de modifier le mot de passe pour un compte Google
 *       404:
 *         description: Utilisateur non trouvé
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

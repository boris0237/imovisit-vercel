/**
 * change password
 */

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Changer le mot de passe utilisateur (compte local)
 *     description: |
 *       Permet à un utilisateur authentifié de changer son mot de passe.
 *       ❗ Cette action est autorisée uniquement pour les comptes **local**.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: ancienMotDePasse123
 *               newPassword:
 *                 type: string
 *                 example: nouveauMotDePasse123
 *               confirmPassword:
 *                 type: string
 *                 example: nouveauMotDePasse123
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Champs manquants ou mots de passe non correspondants
 *       401:
 *         description: Ancien mot de passe incorrect ou utilisateur non authentifié
 *       403:
 *         description: Compte non local (Google, etc.)
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
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

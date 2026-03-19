/**
 * @swagger
 * /api/users/confirm-email-change:
 *   get:
 *     tags:
 *       - Authentification
 *     summary: Confirme le changement d'email
 *     description: |
 *       Vérifie le token envoyé par mail pour confirmer le nouvel email d'un utilisateur.
 *       Le token contient l'id de l'utilisateur et le nouvel email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Token JWT envoyé par mail pour valider le nouvel email
 *         schema:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Email mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Email mis à jour avec succès !
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: nouveauemail@example.com
 *       400:
 *         description: Token manquant ou invalide / expiré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Lien invalide ou expiré
 *                 error:
 *                   type: string
 *                   example: jwt expired
 */



import { prisma } from "@/services/db";
import { apiResponse } from "@/lib/api-response";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return apiResponse({ status: 400, message: "Token manquant" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, newEmail: string };

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { email: decoded.newEmail },
    });

    return apiResponse({
      status: 200,
      message: "Email mis à jour avec succès !",
      data: { email: user.email },
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

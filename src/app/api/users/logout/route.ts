/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Déconnexion utilisateur
 *     description: Supprime le cookie JWT pour déconnecter l'utilisateur.
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *                 data:
 *                   type: null
 *                 error:
 *                   type: null
 *       500:
 *         description: Erreur serveur lors de la déconnexion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la déconnexion"
 *                 error:
 *                   type: string
 */



import { apiResponse } from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * deconnexion
 */
export async function POST(req: Request) {
  try {
    const res = apiResponse({
      status: 200,
      message: "Déconnexion réussie",
      data: null,
      error: null,
    });

    res.cookies.set("jwt", "", {
      maxAge: 0,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors de la déconnexion",
        error: err instanceof Error ? err.message : null,
      },
      { status: 500 }
    );
  }
}

import { prisma } from "@/service/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { apiResponse } from "@/lib/api-response";
import { AuthProvider } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return apiResponse({
        status: 400,
        message: "Email requis",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return apiResponse({
        status: 404,
        message: "Utilisateur non trouvé",
      });
    }

    switch (user.authProvider) {
      case AuthProvider.local:
        if (!password) {
          return apiResponse({
            status: 400,
            message: "Mot de passe requis",
          });
        }

        if (!user.password) {
          return apiResponse({
            status: 401,
            message: "Compte invalide",
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return apiResponse({
            status: 401,
            message: "Mot de passe incorrect",
          });
        }
        break;

      case AuthProvider.google:

        break;
    }

    // GÉNÉRATION DU TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        name: user.name,
        avatar: user.avatar,
        typeCompte: user.typeCompte,
        verified: user.verified,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return apiResponse({
      status: 200,
      message: "Connexion réussie",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (err) {
    console.error(err);
    return ({
      status: 500,
      message: "Erreur lors de l'authentification",
      error: err instanceof Error ? err.message : null,
    });
  }
}



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion locale (email + mot de passe)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@test.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */


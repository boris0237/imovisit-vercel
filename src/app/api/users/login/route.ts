/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Connexion utilisateur
 *     description: |
 *       Authentifie un utilisateur. 
 *       Si le compte est de type `local`, vérifie le mot de passe. 
 *       Génère un token JWT et le renvoie avec les informations de l'utilisateur. 
 *       Le token est également placé dans un cookie HTTPOnly.
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
 *                 description: Email de l'utilisateur
 *                 example: ulrichkageu@gmail.com
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur (pour auth local)
 *                 example: 123123123
 *     responses:
 *       200:
 *         description: Connexion réussie
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
 *                   example: Connexion réussie
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Informations de l'utilisateur (sans mot de passe)
 *                       example:
 *                         id: 1
 *                         name: Ulrich Kageu
 *                         email: ulrichkageu@gmail.com
 *                         role: admin
 *                         authProvider: local
 *                         avatar: null
 *                         typeCompte: basic
 *                         verified: true
 *                     token:
 *                       type: string
 *                       description: JWT token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         description: Champs manquants
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
 *                   example: Email requis
 *                 data:
 *                   type: null
 *                 error:
 *                   type: null
 *                   example: null
 *       401:
 *         description: Authentification invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Mot de passe incorrect
 *                 data:
 *                   type: null
 *                 error:
 *                   type: null
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Utilisateur non trouvé
 *                 data:
 *                   type: null
 *                 error:
 *                   type: null
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Erreur lors de l'authentification
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */


import { prisma } from "@/services/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { AuthProvider, User } from "@prisma/client";
import { apiResponse } from "@/lib/api-response";


const JWT_SECRET = process.env.JWT_SECRET!;
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return apiResponse({ status: 400, message: "Email requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiResponse({ status: 404, message: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe pour provider local
    if (user.authProvider === AuthProvider.local) {
      if (!password) {
        return apiResponse({ status: 400, message: "Mot de passe requis" });
      }

      if (!user.password) {
        return apiResponse({ status: 401, message: "Compte invalide" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return apiResponse({ status: 401, message: "Mot de passe incorrect" });
      }
    }

    // Génération du token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        name: user.name,
        phone: user.phone,
        country: user.country,
        city: user.city,
        profession: user.profession,
        age: user.age,
        avatar: user.avatar,
        services: user.services,
        typeCompte: user.typeCompte,
        accountStatus: user.accountStatus,


      } as User,
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user;

    // Crée le JSON de réponse
    const responseData = {
      status: 200,
      message: "Connexion réussie",
      data: {
        user: userWithoutPassword,
        token,
      },
      error: null,
    };

    // Crée NextResponse et ajoute le cookie HTTPOnly
    const res = NextResponse.json(responseData);
    res.cookies.set("jwt", token, {
      httpOnly: true,
      maxAge: 60 * 60,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error(err);
    return apiResponse({
      status: 500,
      message: "Erreur lors de l'authentification",
      error: err instanceof Error ? err.message : null,
    });
  }
}



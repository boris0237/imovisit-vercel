import { prisma } from "@/service/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { AuthProvider } from "@prisma/client";
import { apiResponse } from "@/lib/api-response";


/**
 * connexion user
 */
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
        avatar: user.avatar,
        typeCompte: user.typeCompte,
        verified: user.verified,
      },
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
    return ({
      status: 500,
      message: "Erreur lors de l'authentification",
      error: err instanceof Error ? err.message : null,
    });
  }
}



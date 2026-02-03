//Verifi les Token et les doit Access

// src/lib/auth.ts
import { JWTauth } from "@/types/enum";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || JWTauth;

// Type du payload pour TS
export type TokenPayload = {
  id: string;
  email: string;
  role: "visitor" | "owner" | "agency" | "agent" | "admin";
  iat?: number;
  exp?: number;
};

/**
 * Vérifie le token depuis l'header Authorization et retourne le payload
 * @param authHeader header Authorization: "Bearer <token>"
 * @param allowedRoles roles autorisés pour accéder à la route
 * @returns payload ou NextResponse en cas d'erreur
 */
export function auth(authHeader?: string, allowedRoles?: TokenPayload["role"][]) {
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ message: "Token manquant" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Vérification des rôles si demandé
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return { error: NextResponse.json({ message: "Accès refusé" }, { status: 403 }) };
    }

    return { payload };
  } catch {
    return { error: NextResponse.json({ message: "Token invalide" }, { status: 401 }) };
  }
}

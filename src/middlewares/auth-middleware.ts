/**
 * verifie si le token existe
 */

import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Token manquant" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // @ts-ignore
    (req as any).user = decoded; // on attache l'user au request
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { message: "Token invalide ou expiré" },
      { status: 401 }
    );
  }
}

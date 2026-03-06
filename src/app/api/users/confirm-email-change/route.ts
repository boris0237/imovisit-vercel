export const dynamic = "force-dynamic";

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
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { apiResponse } from "@/lib/api-response";
import { JWTauth } from "@/types/enum";

const JWT_SECRET = process.env.JWT_SECRET || JWTauth;

/// Auth user
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiResponse({
        status: 400,
        message: "Email et mot de passe requis",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return apiResponse({
        status: 404,
        message: "Utilisateur non trouvé",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return apiResponse({
        status: 401,
        message: "Mot de passe incorrect",
      });
    }

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return apiResponse({
      status: 200,
      message: "Authentification réussie",
      data: { user: userWithoutPassword, token },
    });
  }  catch (err) {
    console.error(err)
    return ({
      status: 500,
      message: "Erreur error survenu lors de Authentification",
      error: err instanceof Error ? err.message : null,
    })
  }
}

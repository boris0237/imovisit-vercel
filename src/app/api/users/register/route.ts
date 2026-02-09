import { prisma } from "@/service/db";
import bcrypt from "bcryptjs"
import { apiResponse } from "@/lib/api-response"
import { AuthProvider, UserRole } from "@prisma/client"
import { authMiddleware } from "@/middlewares/auth-middleware"
import { roleMiddleware } from "@/middlewares/role-middleware"



/**
 * affiche les type de user google/local
 */
export async function GET(req: Request) {
  try {
    // Middleware auth
    const authError = authMiddleware(req as any)
    if (authError) return authError
    const roleError = roleMiddleware([UserRole.admin])(req as any)
    if (roleError) return roleError

    const url = new URL(req.url)
    const type = url.searchParams.get("authProvider")

    const users = await prisma.user.findMany({
      where: type ? { authProvider: type as AuthProvider } : undefined,
      orderBy: { createdAt: "desc" },
    })

    const usersNotPassword = users.map(({ password, ...rest }) => rest)

    return apiResponse({
      status: 200,
      message: `Liste des utilisateurs ${type ?? "tous types"}`,
      data: usersNotPassword,
    })
  } catch (err) {
    console.error(err)
    return apiResponse({
      status: 500,
      message: "Aucun utilisateur trouvé pour les critères fournis",
      error: err instanceof Error ? err.message : null,
    })
  }
}


/**
 * creat un user
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, city, country, authProvider, role } = body

    if (!email || !name || !password || !city || !country || !authProvider || !role) {
      return apiResponse({
        status: 400,
        message: "Certains champs sont obligatoires",
      })
    }

    if (authProvider === "local" && !password) {
      return apiResponse({
        status: 400,
        message: "Le mot de passe est obligatoire pour un compte local",
      })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return apiResponse({
        status: 400,
        message: "Un utilisateur avec cet email existe déjà",
      })
    }

    let hashedPassword: string | null = null
    if (authProvider === "local") {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        city,
        country,
        role,
        verified: false,
        authProvider,
        typeCompte: "classique",
      },
    })

    const { password: _, ...userWithoutPassword } = user

    return apiResponse({
      status: 201,
      message: "Utilisateur créé avec succès",
      data: userWithoutPassword,
    })
  } catch (err) {
    console.error(err)
    return apiResponse({
      status: 500,
      message: "Erreur survenue lors de l'inscription",
      error: err instanceof Error ? err.message : null,
    })
  }
}

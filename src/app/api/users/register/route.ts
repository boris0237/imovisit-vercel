import { prisma } from "@/service/db";
import bcrypt from "bcryptjs"
import { apiResponse } from "@/lib/api-response"
import { AuthProvider, UserRole } from "@prisma/client"
import { authMiddleware } from "@/middlewares/auth-middleware"
import { roleMiddleware } from "@/middlewares/role-middleware"

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Liste des utilisateurs
 *     description: Récupère la liste des utilisateurs (admin uniquement)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: authProvider
 *         schema:
 *           type: string
 *           enum: [local, google, facebook]
 *         description: Filtrer par type d’authentification
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 */
export async function GET(req: Request) {
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
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Création d’un utilisateur
 *     description: Crée un nouvel utilisateur avec authentification locale ou sociale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - city
 *               - country
 *               - authProvider
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               authProvider:
 *                 type: string
 *                 enum: [local, google, facebook]
 *               role:
 *                 type: string
 *                 enum: [admin, user, visitor]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
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
    return ({
      status: 500,
      message: "Erreur survenue lors de l'inscription",
      error: err instanceof Error ? err.message : null,
    })
  }
}

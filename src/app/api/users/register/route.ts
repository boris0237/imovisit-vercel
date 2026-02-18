/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Création d'un nouvel utilisateur
 *     description: Permet de créer un utilisateur local ou Google
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - authProvider
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Royal Tech"
 *               email:
 *                 type: string
 *                 example: "royaltech.sarl@gmail.com"
 *               password:
 *                 type: string
 *                 description: Obligatoire si authProvider = local
 *                 example: "123123123"
 *               phone:
 *                 type: string
 *                 example: "692134087"
 *               country:
 *                 type: string
 *                 example: "Cameroun"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.png"
 *               authProvider:
 *                 type: string
 *                 enum: [local, google]
 *                 example: "local"
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Champs manquants ou email déjà existant
 *       500:
 *         description: Erreur serveur
 */


/**
 * @swagger
 * /api/users/register:
 *   get:
 *     tags:
 *       - Users
 *     summary: Liste de tous les utilisateurs
 *     description: Retourne tous les utilisateurs (local + google)
 *     responses:
 *       200:
 *         description: Liste de tous les utilisateurs
 */

/**
 * @swagger
 * /api/users/register?authProvider=local:
 *   get:
 *     tags:
 *       - Users
 *     summary: Liste des utilisateurs locaux
 *     description: Retourne uniquement les utilisateurs avec authProvider=local
 *     responses:
 *       200:
 *         description: Liste des utilisateurs locaux
 */

/**
 * @swagger
 * /api/users/register?authProvider=google:
 *   get:
 *     tags:
 *       - Users
 *     summary: Liste des utilisateurs Google
 *     description: Retourne uniquement les utilisateurs avec authProvider=google
 *     responses:
 *       200:
 *         description: Liste des utilisateurs Google
 */


import { prisma } from "@/service/db";
import bcrypt from "bcryptjs"
import { apiResponse } from "@/lib/api-response"
import { AuthProvider, UserRole } from "@prisma/client"
import { authMiddleware } from "@/middlewares/auth-middleware"
import { roleMiddleware } from "@/middlewares/role-middleware"
import { stringify } from "querystring";



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
    const { name, email, password, phone, country, authProvider, role, avatar } = body
    console.log(body)

    if (!email || !name || !authProvider || !role) {
      return apiResponse({
        status: 400,
        message: stringify(body),
      })
    }

    if (authProvider === AuthProvider.local && !password) {
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
    if (authProvider === AuthProvider.local) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        country,
        role,
        avatar,
        authProvider,
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
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { apiResponse } from "@/lib/api-response"


//// Voir les User
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    const usersNotPassword = users.map(({ password, ...rest }) => rest);

    return apiResponse({
      status: 200,
      message: "Liste des utilisateurs",
      data: usersNotPassword,
    });
  } catch (err) {
    console.error(err)
    return ({
      status: 500,
      message: "Erreur lors de la recuperation des utilisateur",
      error: err instanceof Error ? err.message : null,
    })
  }
}


//// Creer un User
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, city, country } = body

    // Vérification des champs obligatoires
    if (!email || !password || !name) {
      return apiResponse({
        status: 400,
        message: "Email et password sont obligatoires",
      })
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return apiResponse({
        status: 400,
        message: "Un utilisateur avec cet email existe déjà",
      })
    }

    // Hash du password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Création du user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        phone: phone || null,
        city: city || null,
        country: country || null,
        role: "visitor",
        verified: false,
      },
    })

    // Retourne le user sans le password
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
      message: "Erreur error survenu lors de inscription",
      error: err instanceof Error ? err.message : null,
    })
  }
}

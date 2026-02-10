import { prisma } from "@/service/db";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/send-email";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Middleware auth
    const authError = authMiddleware(req as any)
    if (authError) return authError

    const userId = (req as any).user.id

    const { newEmail } = await req.json()
    if (!newEmail) {
      return apiResponse({ status: 400, message: "Nouvel email requis" })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return apiResponse({ status: 404, message: "Utilisateur non trouvé" })
    }

    const existing = await prisma.user.findUnique({ where: { email: newEmail } })
    if (existing) {
      return apiResponse({ status: 400, message: "Email déjà utilisé" })
    }

    if (user.authProvider === "google") {
      return apiResponse({
        status: 403,
        message: "Impossible de changer l'email d'un compte Google. Vous pouvez modifier d'autres informations.",
      })
    }

    // Création du token pour confirmer le mail
    const token = jwt.sign({ id: user.id, newEmail }, JWT_SECRET, { expiresIn: "1h" })
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/users/confirm-email-change?token=${token}`

    await sendEmail({
      to: newEmail,
      subject: "Confirmation de changement d'email",
      html: `Cliquez ici pour confirmer votre nouvel email : <a href="${confirmLink}">${confirmLink}</a>`,
    })

    return apiResponse({ status: 200, message: "Email de confirmation envoyé au nouveau mail !" })
  } catch (err) {
    console.error(err)
    return apiResponse({
      status: 500,
      message: "Erreur lors de l'envoi de l'email",
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

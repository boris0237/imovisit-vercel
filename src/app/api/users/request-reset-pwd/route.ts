/**
 * @swagger
 * /api/users/request-reset-pwd:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Demande de réinitialisation de mot de passe
 *     description: Envoie un email contenant un lien sécurisé pour réinitialiser le mot de passe d'un utilisateur existant.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "utilisateur@example.com"
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               message: "Email de réinitialisation envoyé !"
 *               data: null
 *               error: null
 *       401:
 *         description: Utilisateur non trouvé
 *       400:
 *         description: Requête invalide (email manquant ou mal formaté)
 *       500:
 *         description: Erreur serveur lors de l'envoi de l'email
 */


import { prisma } from "@/service/db";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/send-email";
import { apiResponse } from "@/lib/api-response";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return apiResponse({
        status: 401,
        message: "Utilisateur non trouvé",
      });
    }

    // Création token de reset court
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });

    // Lien à envoyer
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/users/reset-password?token=${token}`;
    const htmlTemplate = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <title>Réinitialisation de mot de passe</title>
          </head>
          <body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f6f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
              <tr>
                <td align="center">
                  <table width="600" style="background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.1)">
                    <tr>
                      <td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;border-radius:12px 12px 0 0;">
                        <h1 style="color:#fff;margin:0">Réinitialisation de mot de passe</h1>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:40px">
                        <p>Bonjour,</p>

                        <p>
                          Nous avons reçu une demande de réinitialisation de votre mot de passe.
                          Si c’est bien vous, cliquez sur le bouton ci-dessous.
                        </p>

                        <div style="text-align:center;margin:30px 0">
                          <a href="${resetLink}"
                            style="padding:16px 40px;background:#667eea;color:#fff;
                            text-decoration:none;border-radius:8px;font-weight:600;">
                              Réinitialiser mon mot de passe
                          </a>
                        </div>

                        <p style="font-size:14px;color:#777">
                          Ou copiez ce lien :
                        </p>

                        <p style="font-size:13px;word-break:break-all;color:#667eea">
                          <a href="${resetLink}">${resetLink}</a>
                        </p>

                        <p style="margin-top:30px;font-size:14px;color:#856404;background:#fff3cd;padding:12px;border-radius:6px">
                          ⏰ Ce lien expire dans <strong>15 minutes</strong>.
                        </p>

                        <p style="font-size:13px;color:#999">
                          Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e9ecef">
                        <p style="font-size:12px;color:#6c757d">
                          © ${new Date().getFullYear()} imoVisite — Tous droits réservés
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
          `;

    await sendEmail({
      to: email,
      subject: "Réinitialisation mot de passe",
      html: htmlTemplate,
    });


    await sendEmail({
      to: email,
      subject: "Réinitialisation mot de passe",
      html: `Clique ici pour réinitialiser ton mot de passe : <a href="${resetLink}">${resetLink}</a>`,
    });

    return apiResponse({
      status: 200,
      message: "Email de réinitialisation envoyé !",
    });
  } catch (err) {
    console.error(err);
    return apiResponse({
      status: 500,
      message: "Erreur lors de l'envoi de l'email",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

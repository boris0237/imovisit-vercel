/**
 * fontion pour envoie de mail
 */

import Mailjet from "node-mailjet"

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!
)

type SendEmailProps = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "no-reply@shopia-app.com",
              Name: "imoVisite",
            },
            To: [
              {
                Email: to,
              },
            ],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      })

    return true
  } catch (error) {
    console.error("Mailjet error:", error)
    throw new Error("Erreur lors de l'envoi de l'email")
  }
}

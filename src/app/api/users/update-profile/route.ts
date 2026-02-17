/**
 * @swagger
 * /api/users/update-profile:
 *   patch:
 *     tags:
 *       - Upload
 *     summary: Mise à jour du profil utilisateur
 *     description: Permet à un utilisateur connecté de mettre à jour ses informations personnelles ainsi que ses documents (avatar, justificatifs, etc.).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Merveille Joys"
 *               age:
 *                 type: integer
 *                 example: 25
 *               phone:
 *                 type: string
 *                 example: "692134087"
 *               city:
 *                 type: string
 *                 example: "Douala"
 *               country:
 *                 type: string
 *                 example: "France"
 *               profession:
 *                 type: string
 *                 example: "Ingénieur Telecom"
 *               services:
 *                 type: string
 *                 example: "Installation fibre optique"
 *               avatar:
 *                 type: string
 *                 format: binary
 *               docJust:
 *                 type: string
 *                 format: binary
 *               docCNI:
 *                 type: string
 *                 format: binary
 *               docDiplome:
 *                 type: string
 *                 format: binary
 *               docContribuable:
 *                 type: string
 *                 format: binary
 *               docRCCM:
 *                 type: string
 *                 format: binary
 *               docTitreFoncier:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               message: "Profil mis à jour avec succès"
 *               data:
 *                 id: "65f8e6c1d8b45f0012a12345"
 *                 name: "Merveille Joys"
 *                 age: 25
 *                 phone: "692134087"
 *                 city: "Douala"
 *                 country: "France"
 *                 profession: "Ingénieur Telecom"
 *                 avatar: "https://cloudinary.com/avatars/avatar.jpg"
 *                 docJust: "https://cloudinary.com/documents/docJust.pdf"
 *                 email: "exemple@mail.com"
 *                 role: "visitor"
 *                 accountStatus: "unverified"
 *               error: null
 *       400:
 *         description: Aucun champ fourni ou champ non autorisé
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur lors de la mise à jour
 */

import { prisma } from "@/service/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handleFormData } from "@/utils/handle-formData";
import { filterFormDataFields } from "@/utils/filter-formData-fields";
import { NextRequest } from "next/server";

const USER_ALLOWED_FIELDS = [
  "name",
  "age",
  "phone",
  "city",
  "country",
  "profession",
  "services",
  "docJust",
  "docCNI",
  "docDiplome",
  "docContribuable",
  "docRCCM",
  "docTitreFoncier",
] as const;

export async function PATCH(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;

    const formData = await req.formData();
    const rawData = await handleFormData(formData);

    if (Object.keys(rawData).length === 0) {
      return apiResponse({
        status: 400,
        message: "Aucun champ fourni pour la mise à jour",
      });
    }

    // Filtrage sécurisé
    const updateData = filterFormDataFields(rawData, USER_ALLOWED_FIELDS);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return apiResponse({
      status: 200,
      message: "Profil mis à jour avec succès",
      data: userWithoutPassword,
    });

  } catch (err: any) {
    return apiResponse({
      status: 400,
      message: err.message || "Erreur lors de la mise à jour",
    });
  }
}

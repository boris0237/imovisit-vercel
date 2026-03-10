/**
 * @swagger
 * /api/users/update-profile:
 *   patch:
 *     tags:
 *       - Upload
 *     summary: Mise à jour du profil utilisateur
 *     description: >
 *       Permet à un utilisateur connecté de mettre à jour ses informations
 *       personnelles ainsi que ses documents (avatar, logo, justificatifs, etc.).
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
 *               companyName:
 *                 type: string
 *                 example: "Immo Prestige SARL"
 *               avatar:
 *                 type: string
 *                 format: binary
 *               companyLogo:
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
 *                 companyName: "Immo Prestige SARL"
 *                 avatar: "https://cloudinary.com/avatars/avatar.jpg"
 *                 companyLogo: "https://cloudinary.com/avatars/logo.jpg"
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

import { prisma } from "@/services/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { handleFormData } from "@/utils/handle-formData";
import { filterFormDataFields } from "@/utils/filter-formData-fields";
import { NextRequest } from "next/server";
import { ROLE_ALLOWED_FIELDS } from "@/types/constant";
import { AccountStatus } from "@prisma/client";

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

    // Filtrage sécurisé selon rôle
    const role = user.role as keyof typeof ROLE_ALLOWED_FIELDS;
    const allowedFieldsForRole = ROLE_ALLOWED_FIELDS[role] || [];
    const updateData = filterFormDataFields(rawData, allowedFieldsForRole);

    if (updateData.phone) {
      updateData.phone = String(updateData.phone); // Force le téléphone en texte
    }
    if (updateData.age) {
      updateData.age = parseInt(String(updateData.age), 10); // Force l'âge en nombre entier
    }

    // Mise à jour du User
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Mise à jour des Properties liées à cet utilisateur
    const propertyUpdateData: Partial<{
      userName: string;
      userCompanyName: string | null;
      userCompanyLogo: string | null;
      userVerified: AccountStatus;
      userAvatar: string | null;
    }> = {};

    if (updateData.name) propertyUpdateData.userName = updateData.name;
    if (updateData.companyName !== undefined) propertyUpdateData.userCompanyName = updateData.companyName;
    if (updateData.companyLogo !== undefined) propertyUpdateData.userCompanyLogo = updateData.companyLogo;
    if (updateData.avatar !== undefined) propertyUpdateData.userAvatar = updateData.avatar;
    if (updateData.isVerified !== undefined) propertyUpdateData.userVerified = updateData.isVerified;

    if (Object.keys(propertyUpdateData).length > 0) {
      await prisma.property.updateMany({
        where: { userId: user.id },
        data: propertyUpdateData,
      });
    }

    const { password, ...userWithoutPassword } = updatedUser;

    return apiResponse({
      status: 200,
      message: "Profil mis à jour avec succès",
      data: userWithoutPassword,
    });
  } catch (err: any) {
    console.error(err.message);
    return apiResponse({
      status: 400,
      message: err.message || "Erreur lors de la mise à jour",
    });
  }
}
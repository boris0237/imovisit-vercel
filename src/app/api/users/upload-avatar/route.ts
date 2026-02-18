/**
 * @swagger
 * /api/users/upload-avatar:
 *   patch:
 *     tags:
 *       - Upload
 *     summary: Met à jour l'avatar de l'utilisateur
 *     description: Upload un avatar sur Cloudinary et met à jour le champ `avatar` dans la base de données. Accessible uniquement aux utilisateurs authentifiés.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image à uploader (jpg, png)
 *     responses:
 *       200:
 *         description: Avatar mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Avatar mis à jour avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                       format: uri
 *                       example: "https://res.cloudinary.com/xxx/avatars/abc123.jpg"
 *       400:
 *         description: Aucun fichier envoyé
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur lors de l'upload
 */


import { prisma } from "@/service/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest } from "next/server";
import { UPLOAD_FOLDERS } from "@/types/constant";

export async function PATCH(req: NextRequest) {
  try {
    // Vérifie l'authentification
    const authError = authMiddleware(req);
    if (authError) return authError;

    const user = (req as any).user;

    // Récupérer le fichier envoyé en FormData
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return apiResponse({
        status: 400,
        message: "Aucun fichier envoyé",
      });
    }

    // Convertir le fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await uploadToCloudinary(buffer, UPLOAD_FOLDERS.AVATAR);

    // Update avatar en BD
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: uploadResult.secure_url },
    });

    return apiResponse({
      status: 200,
      message: "Avatar mis à jour avec succès",
      data: { avatar: updatedUser.avatar },
    });

  } catch (err) {
    console.error(err);
    return apiResponse({
      status: 500,
      message: "Erreur lors de l'upload de l'avatar",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

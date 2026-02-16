/**
 * @swagger
 * /api/users/upload-documents:
 *   patch:
 *     tags:
 *       - Upload
 *     summary: Mettre à jour les documents utilisateur
 *     description: Permet à un utilisateur authentifié d'envoyer et mettre à jour ses documents officiels.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               docCNI:
 *                 type: string
 *                 format: binary
 *                 description: Carte d'identité
 *               docDiplome:
 *                 type: string
 *                 format: binary
 *                 description: Diplôme
 *               docContribuable:
 *                 type: string
 *                 format: binary
 *                 description: Carte de contribuable
 *               docRCCM:
 *                 type: string
 *                 format: binary
 *                 description: RCCM
 *               docTitreFoncier:
 *                 type: string
 *                 format: binary
 *                 description: Titre foncier
 *               docJust:
 *                 type: string
 *                 format: binary
 *                 description: Justificatif divers
 *     responses:
 *       200:
 *         description: Documents mis à jour avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               message: "Documents mis à jour avec succès"
 *               data:
 *                 docCNI: "https://res.cloudinary.com/..."
 *                 docDiplome: "https://res.cloudinary.com/..."
 *                 docContribuable: "https://res.cloudinary.com/..."
 *                 docRCCM: "https://res.cloudinary.com/..."
 *                 docTitreFoncier: "https://res.cloudinary.com/..."
 *                 docJust: "https://res.cloudinary.com/..."
 *       400:
 *         description: Aucun document envoyé ou fichier trop volumineux (>5MB)
 *         content:
 *           application/json:
 *             example:
 *               status: 400
 *               message: "Le fichier docCNI dépasse 5MB"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               message: "Non authentifié"
 *       500:
 *         description: Erreur serveur lors de l'upload
 *         content:
 *           application/json:
 *             example:
 *               status: 500
 *               message: "Erreur upload documents"
 */


import { prisma } from "@/service/db";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const authError = authMiddleware(req);
        if (authError) return authError;

        const user = (req as any).user;

        const formData = await req.formData();
        const updateData: any = {};

        const MAX_SIZE = 5 * 1024 * 1024; //taille doc

        const documentFields = [
            "docCNI",
            "docDiplome",
            "docContribuable",
            "docRCCM",
            "docTitreFoncier",
            "docJust"
        ];

        for (const field of documentFields) {
            const file = formData.get(field) as File | null;

            if (file) {

                if (file.size > MAX_SIZE) {
                    return apiResponse({
                        status: 400,
                        message: `Le fichier ${field} dépasse 5MB`,
                    });
                }

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadResult: any = await uploadToCloudinary(
                    buffer,
                    "documents"
                );

                updateData[field] = uploadResult.secure_url;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return apiResponse({
                status: 400,
                message: "Aucun document envoyé",
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return apiResponse({
            status: 200,
            message: "Documents mis à jour avec succès",
            data: updateData,
        });

    } catch (error) {
        console.error(error);
        return apiResponse({
            status: 500,
            message: "Erreur upload documents",
        });
    }
}

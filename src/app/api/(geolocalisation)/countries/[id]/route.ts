import { apiResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { prisma } from "@/services/db";


/**
 * @swagger
 * /api/countries/{id}:
 *   get:
 *     tags:
 *       - Geolocalisation
 *     summary: Détail d’un pays
 *     description: Récupère un pays par son ID avec ses villes associées.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65fa12ab34cd56ef78901234
 *     responses:
 *       200:
 *         description: Pays trouvé
 *       404:
 *         description: Pays introuvable
 *       500:
 *         description: Erreur serveur
 */

// voir un pays
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const country = await prisma.country.findUnique({
      where: { id: params.id },
      include: { cities: true }
    });

    if (!country) {
      return apiResponse({ status: 404, message: "Pays introuvable" });
    }

    return apiResponse({ status: 200, data: country });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/countries/{id}:
 *   patch:
 *     tags:
 *       - Geolocalisation
 *     summary: Modifier un pays
 *     description: Permet de modifier les informations d’un pays existant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: République du Cameroun
 *               code:
 *                 type: string
 *                 example: CM
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Pays modifié avec succès
 *       400:
 *         description: Nom ou code déjà existant
 *       404:
 *         description: Pays introuvable
 *       500:
 *         description: Erreur serveur
 */

// modifier un pays
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, code, isActive } = body;

    // Vérifier si le pays existe
    const existingCountry = await prisma.country.findUnique({
      where: { id: params.id }
    });

    if (!existingCountry) {
      return apiResponse({ status: 404, message: "Pays introuvable" });
    }

    // Vérifier unicité du nom
    if (name && name !== existingCountry.name) {
      const nameExists = await prisma.country.findUnique({
        where: { name }
      });

      if (nameExists) {
        return apiResponse({
          status: 400,
          message: "Un pays avec ce nom existe déjà"
        });
      }
    }

    // Vérifier unicité du code
    if (code && code !== existingCountry.code) {
      const codeExists = await prisma.country.findUnique({
        where: { code }
      });

      if (codeExists) {
        return apiResponse({
          status: 400,
          message: "Un pays avec ce code existe déjà"
        });
      }
    }

    const updatedCountry = await prisma.country.update({
      where: { id: params.id },
      data: {
        name,
        code,
        isActive
      }
    });

    return apiResponse({
      status: 200,
      message: "Pays modifié avec succès",
      data: updatedCountry
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/countries/{id}:
 *   delete:
 *     tags:
 *       - Geolocalisation
 *     summary: Supprimer un pays
 *     description: Supprime un pays du système. Les villes associées sont conservées.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pays supprimé avec succès
 *       404:
 *         description: Pays introuvable
 *       500:
 *         description: Erreur serveur
 */

// supprimer un pays
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const country = await prisma.country.findUnique({
      where: { id: params.id }
    });

    if (!country) {
      return apiResponse({ status: 404, message: "Pays introuvable" });
    }

    await prisma.country.delete({
      where: { id: params.id }
    });

    return apiResponse({
      status: 200,
      message: "Pays supprimé, villes conservées"
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";


/**
 * @swagger
 * /api/expenses/{expenseId}:
 *   get:
 *     tags:
 *       - Depense
 *     summary: Obtenir une dépense
 *     description: Récupère le détail d’une dépense via son ID.
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65fa1234b1a5c8f23456789
 *     responses:
 *       200:
 *         description: Dépense trouvée
 *       404:
 *         description: Dépense non trouvée
 *       500:
 *         description: Erreur serveur
 */

// afficher une depense
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const expense = await prisma.expense.findUnique({
      where: { id: params.id }
    });

    if (!expense) {
      return apiResponse({
        status: 404,
        message: "Dépense introuvable"
      });
    }

    return apiResponse({
      status: 200,
      data: expense
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/expenses/{expenseId}:
 *   put:
 *     tags:
 *       - Depense
 *     summary: Modifier une dépense
 *     description: Permet de modifier une dépense existante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 60000
 *               description:
 *                 type: string
 *                 example: Changement de pièces
 *               vendor:
 *                 type: string
 *                 example: Garage Moderne
 *     responses:
 *       200:
 *         description: Dépense mise à jour
 *       404:
 *         description: Dépense non trouvée
 *       500:
 *         description: Erreur serveur
 */

// modifier une depense
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const body = await req.json();

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: body
    });

    return apiResponse({
      status: 200,
      message: "Dépense mise à jour",
      data: expense
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}


/**
 * @swagger
 * /api/expenses/{expenseId}:
 *   delete:
 *     tags:
 *       - Depense
 *     summary: Supprimer une dépense
 *     description: Supprime définitivement une dépense du système.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Dépense supprimée
 *       404:
 *         description: Dépense non trouvée
 *       500:
 *         description: Erreur serveur
 */

// supprimer une depense
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    await prisma.expense.delete({
      where: { id: params.id }
    });

    return apiResponse({
      status: 200,
      message: "Dépense supprimée"
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
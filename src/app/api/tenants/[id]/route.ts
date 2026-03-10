/**
 * @swagger
 * /api/tenants/{tenantId}:
 *   get:
 *     tags:
 *       - Locataire
 *     summary: Obtenir un locataire
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Locataire trouvé
 *       404:
 *         description: Locataire introuvable
 */

//voir un locataire
import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req as any)
    if (authError) return authError
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id }
    });

    if (!tenant) {
      return apiResponse({
        status: 404,
        message: "Locataire introuvable"
      });
    }

    return apiResponse({
      status: 200,
      message: "Locataire trouvé",
      data: tenant
    });

  } catch (error: any) {
    return apiResponse({
      status: 500,
      message: error.message
    });
  }
}


//modifier un locataire

/**
 * @swagger
 * /api/tenants/{tenantId}:
 *   put:
 *     tags:
 *       - Locataire
 *     summary: Modifier un locataire
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const body = await req.json();

    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }

    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: body
    });

    return apiResponse({
      status: 200,
      message: "Locataire mis à jour",
      data: tenant
    });

  } catch (error: any) {
    return apiResponse({
      status: 500,
      message: error.message
    });
  }
}

//delete locataire

/**
 * @swagger
 * /api/tenants/{tenantId}:
 *   delete:
 *     tags:
 *       - Locataire
 *     summary: Supprimer un locataire
 */

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req as any)
    if (authError) return authError
    await prisma.tenant.delete({
      where: { id: params.id }
    });

    return apiResponse({
      status: 200,
      message: "Locataire supprimé"
    });

  } catch (error: any) {
    return apiResponse({
      status: 500,
      message: error.message
    });
  }
}
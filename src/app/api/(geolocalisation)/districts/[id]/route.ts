import { prisma } from "@/services/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";


// GET ONE
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const district = await prisma.district.findUnique({
      where: { id: params.id },
      include: {
        city: {
          include: {
            country: true
          }
        }
      }
    });

    if (!district) {
      return apiResponse({ status: 404, message: "Quartier introuvable" });
    }

    return apiResponse({ status: 200, data: district });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}



// UPDATE
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { name, cityId, isActive } = body;

    const district = await prisma.district.findUnique({
      where: { id: params.id }
    });

    if (!district) {
      return apiResponse({ status: 404, message: "Quartier introuvable" });
    }

    // Vérifier doublon si changement
    if (name && cityId) {
      const existing = await prisma.district.findFirst({
        where: {
          name,
          cityId,
          NOT: { id: params.id }
        }
      });

      if (existing) {
        return apiResponse({
          status: 400,
          message: "Quartier déjà existant pour cette ville"
        });
      }
    }

    const updated = await prisma.district.update({
      where: { id: params.id },
      data: { name, cityId, isActive }
    });

    return apiResponse({
      status: 200,
      message: "Quartier mis à jour",
      data: updated
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}

// DELETE PHYSIQUE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const district = await prisma.district.findUnique({
      where: { id: params.id }
    });

    if (!district) {
      return apiResponse({ status: 404, message: "Quartier introuvable" });
    }


    await prisma.district.delete({
      where: { id: params.id }
    });

    return apiResponse({
      status: 200,
      message: "Quartier supprimé avec succès"
    });

  } catch (error: any) {
    return apiResponse({ status: 500, message: error.message });
  }
}
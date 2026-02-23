import { prisma } from "@/service/db";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { authMiddleware } from "@/middlewares/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    const authError = authMiddleware(req);
    if (authError) return authError;

    const body = await req.json();
    const { propertyId, date, startTime, endTime, reason } = body;

    if (!propertyId) {
      return apiResponse({ status: 400, message: "propertyId requis" });
    }

    const decodedUser = (req as any).user;

    const exception = await prisma.availabilityException.create({
      data: {
        ownerId: decodedUser.id,
        propertyId,
        date: date ? new Date(date) : null,
        startTime,
        endTime,
        reason
      }
    });

    return apiResponse({
      status: 201,
      message: "Exception créée",
      data: exception
    });

  } catch (err: any) {
    return apiResponse({ status: 500, message: err.message });
  }
}
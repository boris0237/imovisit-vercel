/**
 * verifie quel User.role passe
 */
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export function roleMiddleware(roles: UserRole[]) {
  return (req: NextRequest) => {
    // @ts-ignore
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return NextResponse.json(
        { message: "Accès refusé (rôle insuffisant)" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}

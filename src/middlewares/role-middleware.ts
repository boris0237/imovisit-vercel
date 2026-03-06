import { NextRequest, NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export function roleMiddleware(roles: UserRole[]) {
  return (req: NextRequest) => {
    // @ts-ignore
    const user = (req as any).user

    if (!user || !roles.includes(user.role)) {
      return NextResponse.json(
        { status: 403, message: "Accès refusé" },
        { status: 403 }
      )
    }

    return null
  }
}

import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET!

export function authMiddleware(req: NextRequest) {
  let token: string | null = null

  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  } else {
    // @ts-ignore
    token = req.cookies.get("jwt")?.value ?? null
  }

  if (!token) {
    return NextResponse.json(
      { status: 401, message: "Token manquant" },
      { status: 401 }
    )
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET) as any
    // @ts-ignore
    (req as any).user = decoded
    return null
  } catch {
    return NextResponse.json(
      { status: 401, message: "Token invalide ou expiré" },
      { status: 401 }
    )
  }
}

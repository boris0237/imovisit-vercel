import { apiResponse } from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * deconnexion
 */
export async function POST(req: Request) {
  try {
    const res = apiResponse({
      status: 200,
      message: "Déconnexion réussie",
      data: null,
      error: null,
    });

    res.cookies.set("jwt", "", {
      maxAge: 0,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        status: 500,
        message: "Erreur lors de la déconnexion",
        error: err instanceof Error ? err.message : null,
      },
      { status: 500 }
    );
  }
}

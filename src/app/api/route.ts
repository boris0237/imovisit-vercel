import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api:
 *   get:
 *     tags:
 *       - Test
 *     summary: Test API racine
 *     responses:
 *       200:
 *         description: API OK
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API fonctionne correctement",
    timestamp: new Date().toISOString(),
  })
}
 
/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test API
 *     description: Endpoint de test
 *     responses:
 *       200:
 *         description: OK
 */
export async function GET() {
  return Response.json({ message: "Swagger works 🎉" })
}

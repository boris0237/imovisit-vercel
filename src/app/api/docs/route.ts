import { swaggerSpec } from "@/lib/swaggerSpec"

export async function GET() {
  return new Response(JSON.stringify(swaggerSpec), {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

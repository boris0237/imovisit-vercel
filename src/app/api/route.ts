import { NextResponse } from 'next/server'

/**
 * test de api 
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString(),
  })
}

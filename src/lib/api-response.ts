//definis le format de reponce de tout mes API

import { NextResponse } from "next/server"

export type ApiResponseOptions = {
  status?: number | undefined
  message?: string
  data?: any
  error?: Error | null         
}

export function apiResponse({
  status = 200,
  message = "Success",
  data = null,
  error = null,
}: ApiResponseOptions) {
  return NextResponse.json(
    {
      status,
      message,
      data,
      error: error instanceof Error ? error.message : error,
    },
    { status }
  )
}


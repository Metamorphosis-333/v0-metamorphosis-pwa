import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  // No authentication required - using localStorage for data persistence
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

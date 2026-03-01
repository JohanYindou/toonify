import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Routes qui nécessitent d'être connecté
const protectedRoutes = ["/profile", "/library", "/settings"]

// Routes accessibles uniquement si NON connecté
const authRoutes = ["/login", "/register"]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  console.log("middleware user:", user?.email)
  const path = request.nextUrl.pathname

  // Pas connecté + route protégée → redirect login
  if (!user && protectedRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Déjà connecté + page auth → redirect accueil
  if (user && authRoutes.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
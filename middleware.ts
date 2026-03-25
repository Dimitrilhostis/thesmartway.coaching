import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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
  const path = request.nextUrl.pathname

  // Routes protégées client
  if ((path.startsWith('/espace') || path.startsWith('/compte')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Routes protégées admin
  if ((path.startsWith('/dashboard') || path.startsWith('/clients') || path.startsWith('/admin')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Vérification rôle admin
  if (path.startsWith('/dashboard') || path.startsWith('/clients') || path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user!.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/espace', request.url))
    }
  }

  // Déjà connecté → quitter /login
  if (path === '/login' && user) {
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    const dest = profile?.role === 'admin' ? '/dashboard' : '/espace'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)',
  ],
}
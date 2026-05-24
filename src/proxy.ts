import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. If it's the landing page, let it pass
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 2. If it's an API route or static asset, let it pass
  if (pathname.startsWith("/api/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // 3. If they try to go to login or signup pages, redirect them to overview since auth is automatic
  if (pathname === "/login" || pathname === "/signup") {
    const url = request.nextUrl.clone();
    url.pathname = "/overview";
    return NextResponse.redirect(url);
  }

  // 4. Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If not configured, let it pass (dev mode fallback)
    return NextResponse.next();
  }

  // 5. Initialize Supabase client to check session
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 6. If user is not logged in, redirect to auto-login route
  if (!user) {
    const autoLoginUrl = request.nextUrl.clone();
    autoLoginUrl.pathname = "/api/auth/auto-login";
    autoLoginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(autoLoginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

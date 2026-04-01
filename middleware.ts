import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = req.nextUrl.pathname.startsWith("/modules");

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") &&
    user
  ) {
    return NextResponse.redirect(new URL("/modules/calendar", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/modules/:path*", "/login", "/signup"],
};

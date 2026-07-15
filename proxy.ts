import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "#shared/config";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Приземление ссылки из письма. Пропускаем в обе стороны: без сессии сюда
  // приходят по ссылке, а с сессией — если письмо открыли уже залогиненным.
  // Любой редирект отсюда обрывает сброс пароля до verifyOtp.
  if (pathname.startsWith(ROUTES.AUTH_CONFIRM)) {
    return supabaseResponse;
  }

  const isAuthPage =
    pathname.startsWith(ROUTES.LOGIN) ||
    pathname.startsWith(ROUTES.REGISTER) ||
    pathname.startsWith(ROUTES.FORGOT_PASSWORD);

  // ROUTES.RESET_PASSWORD намеренно не в isAuthPage: туда попадают уже с
  // сессией из письма, и правило «залогинен → на дашборд» не дало бы задать
  // пароль. Без сессии эта страница отсекается общим правилом ниже.
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

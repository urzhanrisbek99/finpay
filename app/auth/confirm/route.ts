import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "#shared/api/supabase/server";
import { ROUTES } from "#shared/config";

// Точка приземления ссылки из письма. Меняет одноразовый секрет на сессию
// на сервере (кука ставится здесь) и уводит на форму нового пароля.
//
// Форматов два, потому что Supabase даёт править шаблон письма только со своим
// SMTP:
//   ?code=...       — дефолтный шаблон. Ссылка идёт через /auth/v1/verify
//                     Supabase, тот возвращает PKCE-код. Работает без настроек,
//                     но только в том же браузере: code_verifier лежит в куке,
//                     которую поставил клиент при запросе сброса.
//   ?token_hash=... — кастомный шаблон (нужен свой SMTP). Кросс-девайсно:
//                     ничего локального не требует.
// Оба ведут в одно место, так что переход на кастомный шаблон не потребует
// правок кода.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(ROUTES.RESET_PASSWORD, request.url));
    }
  }

  // Только recovery: иначе роут стал бы универсальным подтверждением любого
  // OTP, включая смену почты.
  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (!error) {
      return NextResponse.redirect(new URL(ROUTES.RESET_PASSWORD, request.url));
    }
  }

  return NextResponse.redirect(
    new URL(`${ROUTES.FORGOT_PASSWORD}?error=invalid`, request.url),
  );
}

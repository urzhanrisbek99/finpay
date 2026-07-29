import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "#shared/api/supabase/server";
import { ROUTES } from "#shared/config";

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

  // Только recovery: иначе роут подтверждал бы любой OTP, включая смену почты.
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

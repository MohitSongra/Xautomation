import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptTwitterCookies } from "@/lib/security/x-cookies";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to save X cookies";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { cookies?: unknown };
    if (!Array.isArray(body.cookies)) {
      return NextResponse.json(
        { error: "cookies must be a JSON array" },
        { status: 400 }
      );
    }

    const encryptedCookies = encryptTwitterCookies(body.cookies);
    const { error } = await supabase
      .from("profiles")
      .update({
        x_cookies: encryptedCookies,
        x_connected: true,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to save encrypted X cookies:", error);
      return NextResponse.json(
        { error: "Failed to save cookies to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("X cookies save failed:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

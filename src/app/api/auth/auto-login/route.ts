import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/overview";
    
    const supabase = await createClient();
    
    const email = "local@xautomation.app";
    const password = "localpassword123";
    
    // 1. Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.log("Auto-login: User doesn't exist or login failed, attempting to create user...", error.message);
      
      // 2. Initialize admin client to bypass email verification
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json(
          { error: "Supabase service key is missing. Add it to .env.local to enable auto-login." },
          { status: 500 }
        );
      }
      
      const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey);
      
      // 3. Create confirmed user
      const { error: signUpError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: "Local Admin"
        }
      });
      
      if (signUpError) {
        console.error("Auto-login signup error:", signUpError);
        return NextResponse.json({ error: signUpError.message }, { status: 500 });
      }
      
      // 4. Sign in again with regular client to set cookies
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("Auto-login second signin error:", signInError);
        return NextResponse.json({ error: signInError.message }, { status: 500 });
      }
    }
    
    // Redirect to next path
    return NextResponse.redirect(new URL(next, request.url));
  } catch (err: any) {
    console.error("Auto-login overall error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

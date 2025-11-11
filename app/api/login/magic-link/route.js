import { createServer } from "../../../../lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const supabase = createServer();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    }
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  return NextResponse.json({ message: "Magic link sent!" });
}

import { createServer } from "../../../lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createServer();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  return NextResponse.json({ message: "Logout successful!" });
}

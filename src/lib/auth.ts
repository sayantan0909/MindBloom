import { supabase } from "@/lib/supabaseClient";

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    console.error("Google login error:", error.message);
  }
}

export async function logout() {
  await supabase.auth.signOut();
}

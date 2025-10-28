import { supabase } from "@/app/supabase-client";

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.log("Error signing in:", error.message);
  } else if (!error && data) {
    console.log("Sign-in successful:", data);
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.log("Error signing up:", error.message);
    return {error};
  }
  return { data };
};

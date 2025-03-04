import { supabase } from "./supabaseClient";

// Sign up function
export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

// Sign in function
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

// Sign out function
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Get current user session
export const getUser = async () => {
  return await supabase.auth.getUser();
};

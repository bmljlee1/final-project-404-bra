import { createClient } from "@supabase/supabase-js";

// Create a Supabase client for database and authentication
// Import createClient from "@supabase/supabase-js"
// Initialize Supabase with the project URL and API key from environment variables
// Export the Supabase client for use in other files

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

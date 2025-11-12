/**
 * Configuration for Supabase.
 *
 * IMPORTANT:
 * The Supabase URL and Key are loaded from environment variables, which should be
 * in a .env file at the project root.
 *
 * Create a .env file and add the following:
 * SUPABASE_URL="YOUR_SUPABASE_URL"
 * SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
 */
export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * A simple check to see if the Supabase credentials have been configured.
 * This is used to display a warning to the user if the app is not configured.
 */
export const isSupabaseConfigured = SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

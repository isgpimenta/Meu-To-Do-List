import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uthhfsalyfbkzzwckknr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aGhmc2FseWZia3p6d2Nra25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjU2MjUsImV4cCI6MjA5NjEwMTYyNX0.d6S9E1G4ZMdCWd4Gn-BexEiUa7yZFJso4PyD8hBOCHI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL ?? "",
//   process.env.SUPABASE_ANON_KEY ?? ""
// );

const supabase = createClient(
  "https://xxcbzlrykfghxsownrsu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Y2J6bHJ5a2ZnaHhzb3ducnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA4Mzk4NTIsImV4cCI6MTk5NjQxNTg1Mn0.9g6zEcrck_BrMII418PVZcqK6UKVaKcyrkiexmns3bg"
);

export default supabase;

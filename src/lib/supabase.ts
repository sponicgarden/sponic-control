import { createClient } from "@supabase/supabase-js";

// These values are set during infrastructure setup (/setup-alpacapps-infra)
const SUPABASE_URL = "https://xumcmantignrocihtrdx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__tLz58gZP0uMuWxmKKhAcQ_mkUQf5i5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

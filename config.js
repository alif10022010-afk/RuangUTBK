qconst SUPABASE_CONFIG = {
  url: "https://xtagyqcujudfdivippar.supabase.co",
  anonKey: "sb_publishable_fJC82nGY5jl9BqU9AqbZXQ_J0yU_cr-"
};

const APP_CONFIG = {
  useSupabase:
    Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey)
};
// Public Supabase project credentials. The anon/publishable key is safe to
// expose client-side — all access is governed by row-level security policies
// configured in the database.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://pdnsrvlubfkbihndqhiq.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_rkti2sLfKZEt2ftrLfvk0A_cEGjc2EX';

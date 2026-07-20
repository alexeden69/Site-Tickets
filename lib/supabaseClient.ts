import { createClient } from '@supabase/supabase-js';

// Valeurs de secours pour que `next build` (export statique) ne plante jamais
// si les vraies clés ne sont pas encore configurées. Sans .env.local avec les
// vraies valeurs, les appels à Supabase échoueront simplement au chargement
// (message affiché dans le bandeau d'erreur du dashboard).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

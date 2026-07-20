-- À copier-coller dans Supabase > SQL Editor > New query > Run.
-- Crée la table qui remplace le stockage local (localStorage) du dashboard.

create table if not exists public.tickets (
  id bigint generated always as identity primary key,
  event text not null,
  event_date date not null,
  qty integer not null check (qty > 0),
  buy_usd numeric not null default 0,
  sell_usd numeric not null default 0,
  status text not null default 'achete' check (status in ('achete', 'listed', 'vendu', 'livre', 'passe')),
  purchased_by text not null default 'commun',
  created_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes (obligatoire sur Supabase).
alter table public.tickets enable row level security;

-- Pas d'authentification pour l'instant : on autorise tout le monde
-- (n'importe qui possédant l'URL + la clé publique du projet) à lire et écrire.
-- À restreindre plus tard si une authentification est ajoutée.
create policy "public read access" on public.tickets
  for select using (true);

create policy "public insert access" on public.tickets
  for insert with check (true);

create policy "public update access" on public.tickets
  for update using (true) with check (true);

create policy "public delete access" on public.tickets
  for delete using (true);

-- Active le suivi en temps réel (pour que les 2 comptes voient les mêmes
-- données se mettre à jour sans recharger la page).
alter publication supabase_realtime add table public.tickets;

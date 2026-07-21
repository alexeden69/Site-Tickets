-- À copier-coller dans Supabase > SQL Editor > New query > Run.
-- Schéma complet du dashboard (utile si tu recrées un projet Supabase
-- de zéro). Si ta base existe déjà, utilise plutôt les scripts
-- d'évolution donnés au fil des mises à jour.

create table if not exists public.tickets (
  id bigint generated always as identity primary key,
  event text not null,
  event_date date not null,
  qty integer not null check (qty > 0),
  buy_usd numeric not null default 0,
  sell_usd numeric not null default 0,
  status text not null default 'achete' check (status in ('achete', 'listed', 'vendu', 'livre', 'passe')),
  purchased_by text not null default 'commun',
  category text,
  bloc text,
  rang text,
  seats text,
  listing_number text,
  account_email text,
  account_password text,
  local_currency text,
  local_buy_amount numeric,
  created_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes (obligatoire sur Supabase).
alter table public.tickets enable row level security;

-- Réservé aux comptes connectés (Supabase Auth), puisque des identifiants
-- de plateforme (email/mot de passe) sont maintenant stockés dans cette
-- table : un accès public rendrait ces identifiants lisibles par n'importe qui.
create policy "authenticated read access" on public.tickets
  for select using (auth.role() = 'authenticated');

create policy "authenticated insert access" on public.tickets
  for insert with check (auth.role() = 'authenticated');

create policy "authenticated update access" on public.tickets
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated delete access" on public.tickets
  for delete using (auth.role() = 'authenticated');

-- Active le suivi en temps réel (pour que les 2 comptes voient les mêmes
-- données se mettre à jour sans recharger la page).
alter publication supabase_realtime add table public.tickets;

-- Liste des événements disponibles dans le menu déroulant du formulaire
-- d'ajout. Un événement peut être créé ici avant même d'avoir un billet.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "authenticated read access" on public.events
  for select using (auth.role() = 'authenticated');

create policy "authenticated insert access" on public.events
  for insert with check (auth.role() = 'authenticated');

alter publication supabase_realtime add table public.events;

-- Activité "ACO" (paniers) : suivi séparé du flip de billets.
-- Aucune trésorerie n'est engagée ici, seul le supplément encaissé compte.
create table if not exists public.aco_transactions (
  id bigint generated always as identity primary key,
  description text not null,
  transaction_date date not null,
  amount numeric not null default 0,
  purchased_by text not null default 'Commun',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.aco_transactions enable row level security;

create policy "authenticated read access" on public.aco_transactions
  for select using (auth.role() = 'authenticated');

create policy "authenticated insert access" on public.aco_transactions
  for insert with check (auth.role() = 'authenticated');

create policy "authenticated update access" on public.aco_transactions
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated delete access" on public.aco_transactions
  for delete using (auth.role() = 'authenticated');

alter publication supabase_realtime add table public.aco_transactions;

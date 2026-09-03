-- Reconcile an existing media table created before the current CMS schema.
-- All additions are conditional so this is safe to run after 0001_init_schema.

alter table media add column if not exists kind text not null default 'image';
alter table media add column if not exists title text not null default 'Untitled';
alter table media add column if not exists slug text not null default gen_random_uuid()::text;
alter table media add column if not exists public_id text not null default gen_random_uuid()::text;
alter table media add column if not exists secure_url text not null default '';
alter table media add column if not exists cloudinary_public_id text not null default gen_random_uuid()::text;
alter table media add column if not exists cloudinary_version text;
alter table media add column if not exists duration numeric;
alter table media add column if not exists tags text[] not null default '{}';

create unique index if not exists media_slug_key on media (slug);
create unique index if not exists media_cloudinary_public_id_key                 
  on media (cloudinary_public_id); 

                                
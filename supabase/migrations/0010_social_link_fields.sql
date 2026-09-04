-- Optional management fields for social link ordering and visibility.
alter table social_links add column if not exists enabled boolean not null default true;
alter table social_links add column if not exists placement text not null default 'footer';
alter table social_links add column if not exists display_order integer not null default 0;
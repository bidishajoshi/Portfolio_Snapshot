-- Direct album-to-media relation for image and video assets.
create table if not exists album_media (
  album_id uuid not null references albums(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  display_order integer not null default 0,
  caption text,
  primary key (album_id, media_id)
);

create index if not exists idx_album_media_album on album_media (album_id, display_order);
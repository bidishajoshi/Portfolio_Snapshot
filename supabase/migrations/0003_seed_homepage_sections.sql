-- DR DSLR — seed the homepage section registry
-- One row per section_key so the admin CMS has something to enable/order/edit
-- immediately, before any content exists. display_mode marks which sections
-- are curated by hand ('manual') vs auto-populated from published content
-- ('automatic'), per spec section 25.

insert into homepage_sections (section_key, enabled, display_order, title, subtitle, display_mode)
values
  ('hero',              true, 1,  null,                         null,                                   'manual'),
  ('selected_works',    true, 2,  'Selected Works',              'A curated look at recent photography', 'manual'),
  ('featured_albums',   true, 3,  'Featured Albums',             'Complete stories, beautifully told',   'manual'),
  ('about',             true, 4,  'About Himal',                 null,                                   'manual'),
  ('services',          true, 5,  'Services',                    'Photography for every occasion',       'automatic'),
  ('featured_films',    true, 6,  'Featured Films',               'Cinematic stories in motion',          'manual'),
  ('stories',           true, 7,  'Photography Stories',          'Journal entries from behind the lens', 'automatic'),
  ('latest_work',       true, 8,  'Latest Work',                  'Freshly published photography',        'automatic'),
  ('night_and_light',   true, 9,  'Night & Light',                'Long exposures and low-light work',    'manual'),
  ('testimonials',      true, 10, 'What Clients Say',             null,                                   'automatic'),
  ('social',            true, 11, 'Follow Along',                 null,                                   'automatic'),
  ('contact_cta',       true, 12, 'Let''s Create Something',      'Get in touch to book your session',    'manual')
on conflict (section_key) do nothing;

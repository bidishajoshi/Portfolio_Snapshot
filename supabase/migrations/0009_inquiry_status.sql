alter table inquiries add column if not exists subject text;
alter table inquiries add column if not exists status text not null default 'new';
alter table inquiries add constraint inquiries_status_check check (status in ('new', 'read', 'replied', 'completed'));
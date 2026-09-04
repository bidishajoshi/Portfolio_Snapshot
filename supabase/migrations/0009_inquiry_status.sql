alter table inquiries add column if not exists subject text;
alter table inquiries add column if not exists status text not null default 'new';
do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'inquiries_status_check') then
		alter table inquiries add constraint inquiries_status_check check (status in ('new', 'read', 'replied', 'completed'));
	end if;
end $$;
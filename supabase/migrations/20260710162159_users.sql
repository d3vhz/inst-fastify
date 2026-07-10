create table public.users (
  id uuid primary key
    references auth.users(id)
    on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,

  roles text[] not null
    default array['user']::text[],

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

alter table public.users
add constraint user_valid_first_name
check (
  first_name is null
  or (
    char_length(first_name) > 0
    and char_length(first_name) <= 15
  )
);

alter table public.users
add constraint user_valid_last_name
check (
  last_name is null
  or (
    char_length(last_name) > 0
    and char_length(last_name) <= 15
  )
);

alter table public.users
add constraint users_valid_roles
check (
  roles <@ array['user', 'admin']::text[]
  and array_length(roles, 1) > 0
);

alter table public.users
add constraint users_valid_avatar_url
check (
  avatar_url is null
  or (
    char_length(avatar_url) > 0
    and avatar_url ~ '^https?://[^/]+(/.*)?$'
  )
);

create trigger user_handle_updated_at
before update on public.users
for each row
execute function public.handle_updated_at_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as
$$
begin
  insert into public.users (id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.users enable row level security;

create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can delete own profile"
on public.users
for delete
to authenticated
using (auth.uid() = id);

create policy "Service role has full access"
on public.users
for all
to service_role
using (true)
with check (true);

grant select, update, delete on public.users to authenticated;
grant all on public.users to service_role;
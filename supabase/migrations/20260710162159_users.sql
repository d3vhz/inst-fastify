create type public.user_role as enum ('user', 'admin');

create table public.users (
  id uuid primary key
    references auth.users(id)
    on delete cascade,
  first_name varchar(15),
  last_name varchar(15),
  avatar_url text,

  roles public.user_role[] not null
    default array['user']::public.user_role[],

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

alter table public.users
add constraint user_valid_first_name
check (
  first_name is null
  or char_length(first_name) > 0
);

alter table public.users
add constraint user_valid_last_name
check (
  last_name is null
  or char_length(last_name) > 0
);

alter table public.users
add constraint users_valid_roles
check (
  roles <@ array['user', 'admin']::public.user_role[]
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

grant select, update, delete on public.users to authenticated;
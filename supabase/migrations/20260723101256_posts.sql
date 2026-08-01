create type public.post_status as enum ('active', 'archived');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.users(id)
    on delete cascade,

  img_urls text[] not null default array[]::text[],
  caption varchar(500) not null,
  status public.post_status not null,

  likes integer not null default 0,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  primary key (post_id, user_id)
);

create trigger post_handle_updated_at
before update
on public.posts
for each row
execute function public.handle_updated_at_column();

create function public.handle_post_like()
  returns trigger
  language plpgsql
  as
$$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set likes = likes + 1
    where id = new.post_id;
    return new;

  elsif tg_op = 'DELETE' then
    if exists (select 1 from public.posts where id = old.post_id) then
      update public.posts
      set likes = likes - 1
      where id = old.post_id;
    end if;
    return old;

  end if;
end;
$$;

create trigger post_handle_like
after insert or delete on public.post_likes
for each row
execute function public.handle_post_like();

create or replace function public.array_urls_valid(urls text[])
returns boolean
language plpgsql
immutable
as $$
declare
  url text;
begin
  if array_length(urls, 1) = 0 then
    return true;
  end if;

  if array_length(urls, 1) > 5 then
    return false;
  end if;
  
  foreach url in array urls
  loop
    if char_length(url) = 0 or url !~ '^https?://[^/]+(/.*)?$' then
      return false;
    end if;
  end loop;
  
  return true;
end;
$$;

alter table public.posts
add constraint posts_valid_img_urls
check (public.array_urls_valid(img_urls));

alter table public.posts
add constraint posts_valid_caption
check (char_length(caption) > 0);

alter table public.posts
add constraint posts_valid_status
check (
  status in ('active', 'archived')
);

alter table public.posts
enable row level security;

alter table public.post_likes
enable row level security;

create policy "Users can read all posts"
on public.posts
for select
to public
using (true);

create policy "Users can create own post"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own post"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own post"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read all likes"
on public.post_likes
for select
to public
using (true);

create policy "Users can create own like"
on public.post_likes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Prohibition on updating likes"
on public.post_likes
for update
using (false);

create policy "Users can delete own like"
on public.post_likes
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.posts, public.post_likes to authenticated;
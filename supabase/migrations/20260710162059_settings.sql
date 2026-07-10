create extension if not exists "citext" with schema "public";
create extension if not exists "pg_trgm" with schema "public";

create function public.handle_updated_at_column()
  returns trigger
  language plpgsql
  as
$$
  begin
    new.updated_at = timezone('utc'::text, now());
    return new;
  end;
$$;
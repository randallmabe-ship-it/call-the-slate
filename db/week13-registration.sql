-- Apply once to the existing Call The Slate database. Legacy entries retain their original scope.
begin;

insert into public.cts_weeks (season, week, status) values (2026, 13, 'open')
on conflict (season, week) do nothing;

-- Source: https://www.nfl.com/schedules/2026/by-week/week-13 . Times are Eastern.
insert into public.cts_games (week_id, away_team, home_team, kickoff_at)
select w.id, g.away, g.home, g.kickoff::timestamptz
from public.cts_weeks w
cross join (values
  ('KC','LAR','2026-12-03 20:15-05'),
  ('DET','ATL','2026-12-06 13:00-05'), ('JAX','CHI','2026-12-06 13:00-05'),
  ('CIN','CLE','2026-12-06 13:00-05'), ('GB','NO','2026-12-06 13:00-05'),
  ('SF','NYG','2026-12-06 13:00-05'), ('LAC','TB','2026-12-06 13:00-05'),
  ('WAS','TEN','2026-12-06 13:00-05'), ('PHI','ARI','2026-12-06 16:05-05'),
  ('MIA','DEN','2026-12-06 16:05-05'), ('CAR','MIN','2026-12-06 16:25-05'),
  ('BUF','NE','2026-12-06 16:25-05'), ('HOU','PIT','2026-12-06 20:20-05'),
  ('DAL','SEA','2026-12-07 20:15-05')
) as g(away,home,kickoff)
where w.season = 2026 and w.week = 13
and not exists (
  select from public.cts_games old
  where old.week_id = w.id and old.away_team = g.away and old.home_team = g.home
);

alter table public.cts_public_entries add column if not exists week_id uuid references public.cts_weeks(id);
create unique index if not exists cts_public_entries_week_email
  on public.cts_public_entries (week_id, lower(btrim(email))) where week_id is not null;

-- Applies in addition to the original INSERT policy. Guest registrants cannot mark a scoped entry paid.
create policy "validate weekly public registrations" on public.cts_public_entries
as restrictive for insert to anon, authenticated with check (
  week_id is null or (
    payment_status = 'pending' and payment_method is null and not season_long
    and (weekly_straight_up or weekly_ats)
    and length(btrim(display_name)) between 2 and 50
    and display_name !~ '[[:cntrl:]]' and length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    and created_at between statement_timestamp() - interval '1 minute' and clock_timestamp() + interval '1 minute'
    and exists (
      select from public.cts_weeks w where w.id = cts_public_entries.week_id
      and w.season = 2026 and w.week = 13 and w.status in ('open','in_progress')
      and exists (select from public.cts_games g where g.week_id = w.id and g.kickoff_at > statement_timestamp())
    )
  )
);

create function public.cts_register_week13(
  p_team text, p_email text, p_straight boolean, p_spread boolean, p_request uuid
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  target_week uuid;
  clean_team text := btrim(p_team);
  clean_email text := lower(btrim(p_email));
  entry_id uuid;
  conflict_name text;
begin
  if clean_team is null or length(clean_team) not between 2 and 50 or clean_team ~ '[[:cntrl:]]'
     or clean_email is null or length(clean_email) > 254 or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     or p_straight is null or p_spread is null or not (p_straight or p_spread) or p_request is null then
    return jsonb_build_object('status', 'invalid');
  end if;
  select w.id into target_week from public.cts_weeks w
  where w.season = 2026 and w.week = 13 and w.status in ('open','in_progress')
    and exists (select from public.cts_games g where g.week_id = w.id and g.kickoff_at > statement_timestamp());
  if target_week is null then return jsonb_build_object('status', 'closed'); end if;

  -- A retry of exactly the same signed-up details gets the same receipt without reading private entries.
  entry_id := left(encode(sha256(convert_to(jsonb_build_array(
    p_request, target_week, clean_team, clean_email, p_straight, p_spread
  )::text, 'UTF8')), 'hex'),32)::uuid;
  begin
    insert into public.cts_public_entries (id, week_id, display_name, email, weekly_straight_up, weekly_ats)
    values (entry_id, target_week, clean_team, clean_email, p_straight, p_spread);
  exception when unique_violation then
    get stacked diagnostics conflict_name = CONSTRAINT_NAME;
    if conflict_name = 'cts_public_entries_week_email' then
      return jsonb_build_object('status', 'already_registered');
    elsif conflict_name <> 'cts_public_entries_pkey' then
      raise;
    end if;
  end;
  return jsonb_build_object('status','registered',
    'receipt','W13-' || upper(left(replace(entry_id::text,'-',''),12)));
end;
$$;
revoke all on function public.cts_register_week13(text,text,boolean,boolean,uuid) from public;
grant execute on function public.cts_register_week13(text,text,boolean,boolean,uuid) to anon, authenticated;
notify pgrst, 'reload schema';
commit;

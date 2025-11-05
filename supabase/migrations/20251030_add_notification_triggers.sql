-- Migration: add notification triggers for idea likes, comments, and comment likes
-- Creates notification rows when a like or comment is created

-- Function: notify when an idea is liked
create or replace function public.notify_on_idea_like()
returns trigger
language plpgsql
security definer
as $$
declare
  idea_author uuid;
begin
  -- get idea author
  select author into idea_author from public.ideas where id = new.idea_id;

  -- don't notify if author is the liker or author is null
  if idea_author is null or idea_author = new.user_id then
    return new;
  end if;

  insert into public.notifications(user_id, type, content, is_read, created_at)
  values (
    idea_author,
    'like',
    format('%s liked your idea', (select coalesce(p.username, 'Someone') from public.profiles p where p.id = new.user_id)),
    false,
    timezone('utc'::text, now())
  );

  return new;
end;
$$;

-- Trigger for idea_likes AFTER INSERT
drop trigger if exists trg_notify_idea_like on public.idea_likes;
create trigger trg_notify_idea_like
after insert on public.idea_likes
for each row execute function public.notify_on_idea_like();


-- Function: notify when a comment is posted
create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
as $$
declare
  idea_author uuid;
  commenter_username text;
begin
  -- get idea author
  select author into idea_author from public.ideas where id = new.idea_id;

  -- don't notify if author is the commenter or author is null
  if idea_author is null or idea_author = new.author then
    return new;
  end if;

  select coalesce(username, 'Someone') into commenter_username from public.profiles where id = new.author;

  insert into public.notifications(user_id, type, content, is_read, created_at)
  values (
    idea_author,
    'comment',
    format('%s commented on your idea: %s', commenter_username, left(new.content, 200)),
    false,
    timezone('utc'::text, now())
  );

  return new;
end;
$$;

-- Trigger for comments AFTER INSERT
drop trigger if exists trg_notify_on_comment on public.comments;
create trigger trg_notify_on_comment
after insert on public.comments
for each row execute function public.notify_on_comment();


-- Function: notify when a comment is liked
create or replace function public.notify_on_comment_like()
returns trigger
language plpgsql
security definer
as $$
declare
  comment_author uuid;
  liker_username text;
begin
  -- get comment author
  select author into comment_author from public.comments where id = new.comment_id;

  -- don't notify if author is the liker or author is null
  if comment_author is null or comment_author = new.user_id then
    return new;
  end if;

  select coalesce(username, 'Someone') into liker_username from public.profiles where id = new.user_id;

  insert into public.notifications(user_id, type, content, is_read, created_at)
  values (
    comment_author,
    'like',
    format('%s liked your comment: %s', liker_username, left((select content from public.comments where id = new.comment_id), 200)),
    false,
    timezone('utc'::text, now())
  );

  return new;
end;
$$;

-- Trigger for comment_likes AFTER INSERT
drop trigger if exists trg_notify_comment_like on public.comment_likes;
create trigger trg_notify_comment_like
after insert on public.comment_likes
for each row execute function public.notify_on_comment_like();

-- END migration

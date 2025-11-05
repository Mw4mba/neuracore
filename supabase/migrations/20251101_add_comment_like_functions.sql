-- Add comment like helper functions
create or replace function public.increment_comment_likes(comment_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.comments
  set likes = likes + 1
  where id = increment_comment_likes.comment_id;
end;
$$;

create or replace function public.decrement_comment_likes(comment_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.comments
  set likes = greatest(0, likes - 1)
  where id = decrement_comment_likes.comment_id;
end;
$$;
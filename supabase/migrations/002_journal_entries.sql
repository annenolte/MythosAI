-- Journal entries table
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  character_id text not null,
  content text not null,
  user_question text,
  saved_at timestamptz default now()
);

-- Enable Row Level Security
alter table journal_entries enable row level security;

-- Users can only see their own journal entries
create policy "Users can view own journal entries"
  on journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal entries"
  on journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can delete own journal entries"
  on journal_entries for delete using (auth.uid() = user_id);

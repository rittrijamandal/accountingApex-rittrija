-- Store full accounting world document (transactions, COA, rubric, etc.) for Expert manual authoring
alter table public.worlds
  add column if not exists payload jsonb not null default '{}'::jsonb;

comment on column public.worlds.payload is 'Accounting APEX world document (meta, transactions, rubric, taskPrompt, …)';

-- =====================================================================
-- DINPL Website — Supabase Schema
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SITE CONTENT — every editable paragraph/heading, keyed by page+field
--    e.g. key = 'home.hero.title', 'about.heritage.body', 'contact.address'
-- ---------------------------------------------------------------------
create table site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. STATS — home page stat cards
-- ---------------------------------------------------------------------
create table stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  icon text default 'Store',
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- 3. BRANDS — brand portfolio (About page)
-- ---------------------------------------------------------------------
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  description text,
  image_url text,
  color text default 'bg-red-600',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. TEAM MEMBERS — full employee directory (replaces Organization)
-- ---------------------------------------------------------------------
create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  department text,               -- free text, filterable on the public page
  quote text,
  image_url text,
  linkedin_url text,
  sort_order int not null default 0,
  -- roadmap: employee self-service login (Phase 2) links here once enabled
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_team_members_department on team_members(department);

-- ---------------------------------------------------------------------
-- 5. WALL POSTS — CSR / AOP Event / Recognition / Announcement
--    Includes scheduling (publish/expire) and a like counter (roadmap items)
-- ---------------------------------------------------------------------
create table wall_posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('csr', 'aop', 'recognition', 'announcement')),
  title text not null,
  content text not null,
  image_url text,
  likes_count int not null default 0,
  publish_at timestamptz not null default now(),   -- roadmap: scheduled posts
  expire_at timestamptz,                            -- null = never expires
  created_at timestamptz not null default now()
);
create index idx_wall_posts_publish on wall_posts(publish_at desc);

-- Anonymous-safe like tracking (one like per browser session, not per user)
create table wall_post_likes (
  post_id uuid references wall_posts(id) on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, session_id)
);

-- ---------------------------------------------------------------------
-- 6. INTERNAL PROGRAMS — Careers Hub program blocks
-- ---------------------------------------------------------------------
create table internal_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
-- 7. VACANCIES — job postings, with scheduling + active toggle
-- ---------------------------------------------------------------------
create table vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text,
  employment_type text default 'Full-time',
  description text,
  requirements text,
  deadline date,
  active boolean not null default true,
  publish_at timestamptz not null default now(),   -- roadmap: scheduled vacancies
  expire_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. APPLICATIONS — CV submissions, with status tracking (roadmap item)
-- ---------------------------------------------------------------------
create table applications (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid references vacancies(id) on delete set null,
  vacancy_title text,        -- denormalized snapshot in case vacancy is later deleted
  name text not null,
  email text not null,
  phone text,
  note text,
  resume_url text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'shortlisted', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. VENDOR ENQUIRIES — with status tracking (roadmap item)
-- ---------------------------------------------------------------------
create table vendor_enquiries (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  category text,
  contact_name text,
  email text,
  phone text,
  message text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'contacted', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. ADMIN ROLES — multi-admin permissions (roadmap item)
--     Row per admin user; role gates what they can edit in the CMS
-- ---------------------------------------------------------------------
create table admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'super_admin' check (role in ('super_admin', 'hr', 'content')),
  -- super_admin: everything | hr: vacancies+applications+team | content: wall+about+brands+site_content
  created_at timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Public can read everything except applications/vendor_enquiries/admin_roles.
-- Public can INSERT applications and vendor_enquiries (submit CV / enquiry).
-- Only authenticated admins can write anything else, or read the private tables.
-- =====================================================================

alter table site_content enable row level security;
alter table stats enable row level security;
alter table brands enable row level security;
alter table team_members enable row level security;
alter table wall_posts enable row level security;
alter table wall_post_likes enable row level security;
alter table internal_programs enable row level security;
alter table vacancies enable row level security;
alter table applications enable row level security;
alter table vendor_enquiries enable row level security;
alter table admin_roles enable row level security;

-- Public read on content tables
create policy "public read" on site_content for select using (true);
create policy "public read" on stats for select using (true);
create policy "public read" on brands for select using (true);
create policy "public read" on team_members for select using (true);
create policy "public read" on wall_posts for select using (publish_at <= now() and (expire_at is null or expire_at > now()));
create policy "public read" on internal_programs for select using (true);
create policy "public read" on vacancies for select using (active = true and publish_at <= now() and (expire_at is null or expire_at > now()));

-- Public can like a post and submit applications/enquiries (insert only)
create policy "public can like" on wall_post_likes for insert with check (true);
create policy "public read likes" on wall_post_likes for select using (true);
create policy "public can apply" on applications for insert with check (true);
create policy "public can enquire" on vendor_enquiries for insert with check (true);

-- Admins (any authenticated user) can write to content tables
create policy "admin write" on site_content for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on stats for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on brands for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on team_members for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on wall_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on internal_programs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on vacancies for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin read/update" on applications for select using (auth.role() = 'authenticated');
create policy "admin update" on applications for update using (auth.role() = 'authenticated');
create policy "admin read/update" on vendor_enquiries for select using (auth.role() = 'authenticated');
create policy "admin update" on vendor_enquiries for update using (auth.role() = 'authenticated');
create policy "admin manage roles" on admin_roles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================================
-- STORAGE BUCKETS (run these, or create via Dashboard -> Storage -> New bucket)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('images', 'images', true);
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false);

create policy "public read images" on storage.objects for select using (bucket_id = 'images');
create policy "admin write images" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "public upload cvs" on storage.objects for insert with check (bucket_id = 'cvs');
create policy "admin read cvs" on storage.objects for select using (bucket_id = 'cvs' and auth.role() = 'authenticated');
create policy "admin delete cvs" on storage.objects for delete using (bucket_id = 'cvs' and auth.role() = 'authenticated');

-- =====================================================================
-- FUNCTIONS
-- =====================================================================
create or replace function increment_wall_post_likes(post_id_input uuid)
returns void as $$
begin
  update wall_posts set likes_count = likes_count + 1 where id = post_id_input;
end;
$$ language plpgsql security definer;

-- =====================================================================
-- SEED DATA — default site_content keys so the site never renders blank
-- (Edit these values freely from Admin afterward)
-- =====================================================================
insert into site_content (key, value) values
  ('home.hero.title', 'Pioneering Culinary Excellence in Nepal'),
  ('home.hero.subtitle', 'Devyani International Nepal is the powerhouse behind the nation''s most loved international food brands, delivering world-class flavors with local expertise.'),
  ('home.hero.image', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1920&auto=format&fit=crop'),
  ('home.pillars.careers.title', 'Careers & Growth'),
  ('home.pillars.careers.desc', 'Explore open roles and internal programs built for your growth.'),
  ('home.pillars.wall.title', 'The Wall'),
  ('home.pillars.wall.desc', 'CSR moments, AOP events, and team recognition from across DINPL.'),
  ('home.pillars.collaborate.title', 'Collaborate'),
  ('home.pillars.collaborate.desc', 'Partner with us as a vendor or supplier.'),
  ('careers.hero.title', 'Join the Excellence'),
  ('careers.hero.subtitle', 'Building a world-class team to manage world-class brands.'),
  ('team.hero.title', 'Meet the Team'),
  ('team.hero.subtitle', 'The people behind DINPL''s brands, from leadership to every outlet.'),
  ('wall.hero.title', 'The Wall'),
  ('wall.hero.subtitle', 'CSR moments, AOP events, and recognition from across DINPL.'),
  ('collaborate.hero.title', 'Collaborate With Us'),
  ('collaborate.hero.subtitle', 'Forging strategic partnerships with vendors and stakeholders to fuel our nationwide growth.'),
  ('about.hero.title', 'About Devyani International Nepal'),
  ('about.hero.subtitle', 'A strategic franchisee management firm dedicated to elevating the casual dining and quick service experience in Nepal.'),
  ('about.heritage.body', 'Devyani International Nepal Pvt. Ltd. represents the pinnacle of franchisee management in the region. As a core part of the larger Devyani network, we specialize in the meticulous operation of international powerhouse brands like KFC and Pizza Hut.'),
  ('about.mission', 'To be Nepal''s most respected food service operator by delivering consistent quality, operational excellence, and an unmatched customer experience across every brand we manage.'),
  ('about.vision', 'To lead the quick-service restaurant revolution in Nepal, expanding international culinary horizons to every corner of the nation.'),
  ('contact.address', 'Devyani International Nepal Pvt. Ltd., Durbarmarg, Kathmandu, Nepal'),
  ('contact.phone', '+977-1-422XXXX'),
  ('contact.email', 'carrier.nepal@dil-rjcorp.com'),
  ('contact.hours', 'Sun - Fri: 9:00 AM - 6:00 PM')
on conflict (key) do nothing;

insert into stats (label, value, icon, sort_order) values
  ('Total Outlets', '35+', 'Store', 1),
  ('International Brands', '3', 'Globe', 2),
  ('Corporate Experts', '23', 'Users', 3),
  ('Operational Regions', '12+', 'Briefcase', 4)
on conflict do nothing;

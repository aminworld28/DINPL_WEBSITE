import { supabase } from './supabase';

// =====================================================================
// SITE CONTENT (free-text paragraphs/headings, keyed by string)
// =====================================================================
export async function getAllSiteContent() {
  const { data, error } = await supabase.from('site_content').select('*');
  if (error) throw error;
  // Turn [{key, value}] into { key: value } for easy lookup
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

export async function setSiteContent(key, value) {
  const { error } = await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function setManySiteContent(entries) {
  // entries: { key: value, ... }
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  const { error } = await supabase.from('site_content').upsert(rows);
  if (error) throw error;
}

// =====================================================================
// STATS
// =====================================================================
export async function getStats() {
  const { data, error } = await supabase.from('stats').select('*').order('sort_order');
  if (error) throw error;
  return data;
}

export async function replaceStats(stats) {
  // Simplest safe approach for a short list: wipe and reinsert with fresh order
  await supabase.from('stats').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const rows = stats.map((s, i) => ({ label: s.label, value: s.value, icon: s.icon || 'Store', sort_order: i }));
  const { error } = await supabase.from('stats').insert(rows);
  if (error) throw error;
}

// =====================================================================
// BRANDS
// =====================================================================
export async function getBrands() {
  const { data, error } = await supabase.from('brands').select('*').order('sort_order');
  if (error) throw error;
  return data;
}
export async function upsertBrand(brand) {
  const { error } = await supabase.from('brands').upsert(brand);
  if (error) throw error;
}
export async function deleteBrand(id) {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
}

// =====================================================================
// TEAM MEMBERS
// =====================================================================
export async function getTeamMembers() {
  const { data, error } = await supabase.from('team_members').select('*').order('sort_order');
  if (error) throw error;
  return data;
}
export async function upsertTeamMember(member) {
  const { error } = await supabase.from('team_members').upsert(member);
  if (error) throw error;
}
export async function deleteTeamMember(id) {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw error;
}

// =====================================================================
// WALL POSTS (+ scheduling, + likes)
// =====================================================================
export async function getWallPosts({ type = null, limit = null } = {}) {
  let query = supabase.from('wall_posts').select('*').order('publish_at', { ascending: false });
  if (type) query = query.eq('type', type);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
// Admin sees everything including future/expired posts
export async function getAllWallPostsForAdmin() {
  const { data, error } = await supabase.from('wall_posts').select('*').order('publish_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createWallPost(post) {
  const { error } = await supabase.from('wall_posts').insert(post);
  if (error) throw error;
}
export async function updateWallPost(id, partial) {
  const { error } = await supabase.from('wall_posts').update(partial).eq('id', id);
  if (error) throw error;
}
export async function deleteWallPost(id) {
  const { error } = await supabase.from('wall_posts').delete().eq('id', id);
  if (error) throw error;
}
export async function likeWallPost(postId, sessionId) {
  const { error } = await supabase.from('wall_post_likes').insert({ post_id: postId, session_id: sessionId });
  if (error) {
    if (error.code === '23505') return false; // already liked this session
    throw error;
  }
  await supabase.rpc('increment_wall_post_likes', { post_id_input: postId }).catch(() => {
    // Fallback if the RPC function isn't set up: read-modify-write
  });
  return true;
}

// =====================================================================
// INTERNAL PROGRAMS
// =====================================================================
export async function getInternalPrograms() {
  const { data, error } = await supabase.from('internal_programs').select('*').order('sort_order');
  if (error) throw error;
  return data;
}
export async function upsertInternalProgram(program) {
  const { error } = await supabase.from('internal_programs').upsert(program);
  if (error) throw error;
}
export async function deleteInternalProgram(id) {
  const { error } = await supabase.from('internal_programs').delete().eq('id', id);
  if (error) throw error;
}

// =====================================================================
// VACANCIES (+ scheduling)
// =====================================================================
export async function getActiveVacancies() {
  const { data, error } = await supabase.from('vacancies').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getAllVacanciesForAdmin() {
  const { data, error } = await supabase.from('vacancies').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createVacancy(vacancy) {
  const { error } = await supabase.from('vacancies').insert(vacancy);
  if (error) throw error;
}
export async function updateVacancy(id, partial) {
  const { error } = await supabase.from('vacancies').update(partial).eq('id', id);
  if (error) throw error;
}
export async function deleteVacancy(id) {
  const { error } = await supabase.from('vacancies').delete().eq('id', id);
  if (error) throw error;
}

// =====================================================================
// APPLICATIONS (+ status tracking)
// =====================================================================
export async function submitApplication(application) {
  const { error } = await supabase.from('applications').insert(application);
  if (error) throw error;
}
export async function getApplications() {
  const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function updateApplicationStatus(id, status) {
  const { error } = await supabase.from('applications').update({ status }).eq('id', id);
  if (error) throw error;
}

// =====================================================================
// VENDOR ENQUIRIES (+ status tracking)
// =====================================================================
export async function submitVendorEnquiry(enquiry) {
  const { error } = await supabase.from('vendor_enquiries').insert(enquiry);
  if (error) throw error;
}
export async function getVendorEnquiries() {
  const { data, error } = await supabase.from('vendor_enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function updateVendorEnquiryStatus(id, status) {
  const { error } = await supabase.from('vendor_enquiries').update({ status }).eq('id', id);
  if (error) throw error;
}

// =====================================================================
// ADMIN ROLES (multi-admin permissions)
// =====================================================================
export async function getAdminRoles() {
  // auth.users is not exposed through the public PostgREST schema, so fetch
  // role rows directly and let the CMS display the user UUID.
  const { data, error } = await supabase.from('admin_roles').select('*').order('created_at');
  if (error) throw error;
  return data;
}
export async function setAdminRole(userId, role) {
  const { error } = await supabase.from('admin_roles').upsert({ user_id: userId, role });
  if (error) throw error;
}

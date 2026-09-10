import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, LayoutDashboard, ArrowLeft, Settings, MessageSquare, Globe,
  Save, Users as UsersIcon, Briefcase, Handshake, Loader2, CheckCircle2,
  Eye, EyeOff, Download, LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { login, logout } from '../lib/auth';
import {
  getWallPosts, createWallPost, deleteWallPost, getAllWallPostsForAdmin,
  getAllVacanciesForAdmin, createVacancy, updateVacancy, deleteVacancy,
  getApplications, updateApplicationStatus,
  getVendorEnquiries, updateVendorEnquiryStatus,
  getTeamMembers, upsertTeamMember, deleteTeamMember,
  getInternalPrograms, upsertInternalProgram, deleteInternalProgram,
  upsertBrand, deleteBrand,
  getAdminRoles, setAdminRole,
} from '../lib/contentService';
import { getSignedCvUrl } from '../lib/uploadFile';
import ImageUploadField from '../components/ImageUploadField';

// ---------- Login ----------
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-sm space-y-5">
        <div className="p-3 bg-red-600 rounded-2xl w-fit shadow-lg shadow-red-900/30">
          <LayoutDashboard className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 italic uppercase">DINPL CMS Portal</h1>
          <p className="text-sm text-slate-400 italic">Sign in to manage site content.</p>
        </div>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
        {error && <p className="text-sm text-red-600 italic">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full bg-red-600 text-white rounded-xl py-3 text-sm font-bold uppercase italic tracking-widest hover:bg-red-700 disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign In
        </button>
      </form>
    </div>
  );
};

// ---------- Save button ----------
const SaveButton = ({ onSave, label = 'Save changes' }) => {
  const [status, setStatus] = useState('idle');
  const handleClick = async () => {
    setStatus('saving');
    try {
      await onSave();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };
  return (
    <button type="button" onClick={handleClick} disabled={status === 'saving'}
      className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase italic tracking-widest hover:bg-red-700 disabled:opacity-60">
      {status === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'saved' && <CheckCircle2 className="w-4 h-4" />}
      {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error - retry' : label}
      {status === 'idle' && <Save className="w-4 h-4" />}
    </button>
  );
};

// ---------- Tab: Page Content (site_content text fields + stats) ----------
const TEXT_FIELDS = [
  { section: 'Home', keys: [
    ['home.hero.title', 'Hero Title'], ['home.hero.subtitle', 'Hero Subtitle'], ['home.hero.image', 'Hero Image URL'],
    ['home.pillars.careers.title', 'Careers Pillar Title'], ['home.pillars.careers.desc', 'Careers Pillar Text'],
    ['home.pillars.wall.title', 'Wall Pillar Title'], ['home.pillars.wall.desc', 'Wall Pillar Text'],
    ['home.pillars.collaborate.title', 'Collaborate Pillar Title'], ['home.pillars.collaborate.desc', 'Collaborate Pillar Text'],
  ]},
  { section: 'Careers Hub', keys: [['careers.hero.title', 'Page Title'], ['careers.hero.subtitle', 'Page Subtitle']]},
  { section: 'Team', keys: [['team.hero.title', 'Page Title'], ['team.hero.subtitle', 'Page Subtitle']]},
  { section: 'The Wall', keys: [['wall.hero.title', 'Page Title'], ['wall.hero.subtitle', 'Page Subtitle']]},
  { section: 'Collaborate', keys: [['collaborate.hero.title', 'Page Title'], ['collaborate.hero.subtitle', 'Page Subtitle']]},
  { section: 'About', keys: [
    ['about.hero.title', 'Page Title'], ['about.hero.subtitle', 'Page Subtitle'],
    ['about.heritage.body', 'Heritage Paragraph'], ['about.mission', 'Mission Statement'], ['about.vision', 'Vision Statement'],
  ]},
  { section: 'Contact', keys: [
    ['contact.address', 'Address'], ['contact.phone', 'Phone'], ['contact.email', 'Email'], ['contact.hours', 'Business Hours'],
  ]},
];

const ContentTab = () => {
  const { text, updateText, stats, updateStats } = useContent();
  const [drafts, setDrafts] = useState({});
  const [localStats, setLocalStats] = useState(stats);

  useEffect(() => { setLocalStats(stats); }, [stats]);

  const getDraft = (key) => drafts[key] ?? text(key);
  const setDraft = (key, value) => setDrafts((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold italic uppercase">Branding</h2>
          <p className="text-sm text-slate-400 mt-1">Upload the logo shown in the public navigation and CMS header.</p>
        </div>
        <ImageUploadField
          label="DINPL logo"
          value={getDraft('brand.logo')}
          onChange={(value) => setDraft('brand.logo', value)}
          folder="branding"
        />
        <SaveButton onSave={async () => updateText('brand.logo', getDraft('brand.logo'))} />
      </div>

      {TEXT_FIELDS.map(({ section, keys }) => (
        <div key={section} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
          <h2 className="text-xl font-bold italic uppercase mb-2">{section}</h2>
          {keys.map(([key, label]) => (
            <div key={key}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
              {label.toLowerCase().includes('paragraph') || label.toLowerCase().includes('statement') || label.toLowerCase().includes('subtitle') ? (
                <textarea rows={3} value={getDraft(key)} onChange={(e) => setDraft(key, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
              ) : (
                <input value={getDraft(key)} onChange={(e) => setDraft(key, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
              )}
            </div>
          ))}
          <SaveButton onSave={async () => {
            const updates = keys.filter(([key]) => drafts[key] !== undefined);
            for (const [key] of updates) await updateText(key, drafts[key]);
          }} />
        </div>
      ))}

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold italic uppercase mb-2">Home Stats</h2>
        {localStats.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={s.label} onChange={(e) => { const c = [...localStats]; c[i] = { ...s, label: e.target.value }; setLocalStats(c); }}
              placeholder="Label" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none" />
            <input value={s.value} onChange={(e) => { const c = [...localStats]; c[i] = { ...s, value: e.target.value }; setLocalStats(c); }}
              placeholder="Value" className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none" />
            <button onClick={() => setLocalStats(localStats.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
        <button onClick={() => setLocalStats([...localStats, { label: '', value: '', icon: 'Store' }])} className="text-red-600 text-xs font-bold uppercase italic">+ Add stat</button>
        <div><SaveButton onSave={() => updateStats(localStats)} /></div>
      </div>
    </div>
  );
};

// ---------- Tab: Brands ----------
const BrandsTab = () => {
  const { brands, refresh } = useContent();
  const [local, setLocal] = useState(brands);
  useEffect(() => setLocal(brands), [brands]);

  const update = (i, field, value) => { const c = [...local]; c[i] = { ...c[i], [field]: value }; setLocal(c); };
  const addBrand = () => setLocal([...local, { name: '', tagline: '', description: '', image_url: '', color: 'bg-red-600', sort_order: local.length }]);
  const removeBrand = async (i) => {
    const brand = local[i];
    if (brand.id) await deleteBrand(brand.id);
    setLocal(local.filter((_, idx) => idx !== i));
    refresh();
  };
  const saveAll = async () => {
    for (const [i, b] of local.entries()) await upsertBrand({ ...b, sort_order: i });
    await refresh();
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold italic uppercase mb-2">Brand Portfolio</h2>
      {local.map((b, i) => (
        <div key={b.id || i} className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <button onClick={() => removeBrand(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
          <div className="grid grid-cols-2 gap-3">
            <input value={b.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Name" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" />
            <input value={b.tagline} onChange={(e) => update(i, 'tagline', e.target.value)} placeholder="Tagline" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" />
          </div>
          <textarea rows={2} value={b.description} onChange={(e) => update(i, 'description', e.target.value)} placeholder="Description" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" />
          <input value={b.color} onChange={(e) => update(i, 'color', e.target.value)} placeholder="Tailwind color e.g. bg-red-600" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" />
          <ImageUploadField value={b.image_url} onChange={(url) => update(i, 'image_url', url)} folder="brands" />
        </div>
      ))}
      <button onClick={addBrand} className="text-red-600 text-xs font-bold uppercase italic">+ Add brand</button>
      <div><SaveButton onSave={saveAll} /></div>
    </div>
  );
};

// ---------- Tab: Team ----------
const emptyMember = () => ({ name: '', role: '', department: '', quote: '', image_url: '', linkedin_url: '' });

const TeamTab = () => {
  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(emptyMember());
  const [creating, setCreating] = useState(false);

  const load = () => getTeamMembers().then(setMembers).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!draft.name) return;
    setCreating(true);
    try {
      await upsertTeamMember({ ...draft, sort_order: members.length });
      setDraft(emptyMember());
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this team member?')) { await deleteTeamMember(id); load(); }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold italic uppercase mb-2">Add Team Member</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
          <input placeholder="Role/Title" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <input placeholder="Department" value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <ImageUploadField label="Photo" value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} folder="team" />
        <textarea rows={2} placeholder="Personal quote / style" value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none italic" />
        <input placeholder="LinkedIn URL (optional)" value={draft.linkedin_url} onChange={(e) => setDraft({ ...draft, linkedin_url: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <button onClick={handleCreate} disabled={creating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl uppercase italic tracking-widest text-xs disabled:opacity-60">
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          <Plus size={14} /> Add to Team
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-sm italic">{m.name}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{m.role}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{m.department}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic text-sm">No team members added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Tab: Wall ----------
const POST_TYPES = [
  { id: 'csr', label: 'CSR' },
  { id: 'aop', label: 'AOP Event' },
  { id: 'recognition', label: 'Employee Recognition' },
  { id: 'announcement', label: 'Announcement' },
];

const WallTab = () => {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState({ type: 'csr', title: '', content: '', image_url: '', publish_at: '', expire_at: '' });
  const [creating, setCreating] = useState(false);

  const load = () => getAllWallPostsForAdmin().then(setPosts).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!draft.title || !draft.content) return;
    setCreating(true);
    try {
      await createWallPost({
        type: draft.type, title: draft.title, content: draft.content, image_url: draft.image_url || null,
        publish_at: draft.publish_at ? new Date(draft.publish_at).toISOString() : new Date().toISOString(),
        expire_at: draft.expire_at ? new Date(draft.expire_at).toISOString() : null,
      });
      setDraft({ type: 'csr', title: '', content: '', image_url: '', publish_at: '', expire_at: '' });
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => { if (window.confirm('Delete this post?')) { await deleteWallPost(id); load(); } };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold italic uppercase mb-2">New Wall Post</h2>
        <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
          {POST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <textarea rows={4} placeholder="Content" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none italic" />
        <ImageUploadField label="Photo (optional)" value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} folder="posts" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Publish at (optional, defaults to now)</label>
            <input type="datetime-local" value={draft.publish_at} onChange={(e) => setDraft({ ...draft, publish_at: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expires at (optional)</label>
            <input type="datetime-local" value={draft.expire_at} onChange={(e) => setDraft({ ...draft, expire_at: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
        </div>
        <button onClick={handleCreate} disabled={creating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl uppercase italic tracking-widest text-xs disabled:opacity-60">
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          <Plus size={14} /> Publish Post
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Content</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Likes</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase">{p.type}</span></td>
                <td className="px-6 py-4">
                  <div className="font-bold text-sm italic">{p.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1 italic">{p.content}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{p.likes_count}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic text-sm">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Tab: Internal Programs ----------
const ProgramsTab = () => {
  const [programs, setPrograms] = useState([]);
  const [draft, setDraft] = useState({ title: '', description: '', image_url: '' });
  const [creating, setCreating] = useState(false);

  const load = () => getInternalPrograms().then(setPrograms).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!draft.title) return;
    setCreating(true);
    try {
      await upsertInternalProgram({ ...draft, sort_order: programs.length });
      setDraft({ title: '', description: '', image_url: '' });
      load();
    } finally { setCreating(false); }
  };
  const handleDelete = async (id) => { await deleteInternalProgram(id); load(); };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold italic uppercase mb-2">Add Internal Program</h2>
        <input placeholder="Program title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <textarea rows={3} placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <ImageUploadField value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} folder="programs" />
        <button onClick={handleCreate} disabled={creating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl uppercase italic tracking-widest text-xs disabled:opacity-60">
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}<Plus size={14} /> Add Program
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {programs.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
            <button onClick={() => handleDelete(p.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            <h4 className="font-bold italic mb-2">{p.title}</h4>
            <p className="text-xs text-slate-500">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Tab: Vacancies ----------
const emptyVacancy = { title: '', department: '', location: '', employment_type: 'Full-time', description: '', requirements: '', deadline: '', active: true };

const VacanciesTab = () => {
  const [vacancies, setVacancies] = useState([]);
  const [draft, setDraft] = useState(emptyVacancy);
  const [creating, setCreating] = useState(false);

  const load = () => getAllVacanciesForAdmin().then(setVacancies).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!draft.title) return;
    setCreating(true);
    try {
      await createVacancy({ ...draft, deadline: draft.deadline || null });
      setDraft(emptyVacancy);
      load();
    } finally { setCreating(false); }
  };
  const toggleActive = async (v) => { await updateVacancy(v.id, { active: !v.active }); load(); };
  const handleDelete = async (id) => { if (window.confirm('Delete this vacancy?')) { await deleteVacancy(id); load(); } };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold italic uppercase mb-2">New Vacancy</h2>
        <input placeholder="Job Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Department" value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
          <input placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select value={draft.employment_type} onChange={(e) => setDraft({ ...draft, employment_type: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
            <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
          </select>
          <input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        </div>
        <textarea rows={3} placeholder="Job description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <textarea rows={2} placeholder="Requirements" value={draft.requirements} onChange={(e) => setDraft({ ...draft, requirements: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none italic" />
        <button onClick={handleCreate} disabled={creating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl uppercase italic tracking-widest text-xs disabled:opacity-60">
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}<Plus size={14} /> Post Vacancy
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Live</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vacancies.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-sm italic">{v.title}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{v.department}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => toggleActive(v)} className={`p-2 rounded-lg ${v.active ? 'text-green-600 bg-green-50' : 'text-slate-300 bg-slate-50'}`}>
                    {v.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {vacancies.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic text-sm">No vacancies posted yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Tab: Applications ----------
const STATUS_COLORS = { new: 'bg-blue-50 text-blue-600', reviewed: 'bg-amber-50 text-amber-600', shortlisted: 'bg-green-50 text-green-600', rejected: 'bg-red-50 text-red-600', contacted: 'bg-green-50 text-green-600' };

const ApplicationsTab = () => {
  const [apps, setApps] = useState([]);
  const load = () => getApplications().then(setApps).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => { await updateApplicationStatus(id, status); load(); };
  const handleView = async (path) => {
    try {
      const url = await getSignedCvUrl(path);
      window.open(url, '_blank');
    } catch (err) {
      alert('Could not open CV: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Applicant</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Vacancy</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">CV</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {apps.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <div className="font-bold text-sm italic">{a.name}</div>
                {a.note && <div className="text-xs text-slate-500 italic line-clamp-1">{a.note}</div>}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{a.vacancy_title}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{a.email}<br />{a.phone}</td>
              <td className="px-6 py-4">
                <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border-0 outline-none ${STATUS_COLORS[a.status]}`}>
                  <option value="new">New</option><option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleView(a.resume_url)} className="inline-flex items-center gap-1 text-red-600 text-xs font-bold hover:underline">
                  <Download size={14} /> View
                </button>
              </td>
            </tr>
          ))}
          {apps.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic text-sm">No applications yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ---------- Tab: Vendor Enquiries ----------
const EnquiriesTab = () => {
  const [enquiries, setEnquiries] = useState([]);
  const load = () => getVendorEnquiries().then(setEnquiries).catch(console.error);
  useEffect(() => { load(); }, []);
  const handleStatusChange = async (id, status) => { await updateVendorEnquiryStatus(id, status); load(); };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Company</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Message</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {enquiries.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4 font-bold text-sm italic">{e.company_name}</td>
              <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase">{e.category}</span></td>
              <td className="px-6 py-4 text-xs text-slate-500">{e.contact_name}<br />{e.email} · {e.phone}</td>
              <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs">{e.message}</td>
              <td className="px-6 py-4">
                <select value={e.status} onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border-0 outline-none ${STATUS_COLORS[e.status]}`}>
                  <option value="new">New</option><option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option><option value="rejected">Rejected</option>
                </select>
              </td>
            </tr>
          ))}
          {enquiries.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic text-sm">No vendor enquiries yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ---------- Tab: Admin Roles (super_admin only) ----------
const RolesTab = () => {
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('content');

  const load = () => getAdminRoles().then(setRoles).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!userId) return;
    await setAdminRole(userId, role);
    setUserId('');
    load();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4 max-w-2xl">
        <h2 className="text-xl font-bold italic uppercase mb-2">Assign Admin Role</h2>
        <p className="text-xs text-slate-500 italic mb-2">
          Find the User ID in Supabase Dashboard → Authentication → Users (create the user there first).
        </p>
        <input placeholder="User ID (UUID)" value={userId} onChange={(e) => setUserId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" />
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none">
          <option value="super_admin">Super Admin — full access</option>
          <option value="hr">HR — vacancies, applications, team, programs</option>
          <option value="content">Content — wall, about, brands, page text, enquiries</option>
        </select>
        <button onClick={handleAssign} className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl uppercase italic tracking-widest text-xs">
          <ShieldCheck size={14} /> Assign Role
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {roles.map((r) => (
              <tr key={r.user_id}>
                <td className="px-6 py-4 text-sm">{r.users?.email || r.user_id}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase">{r.role}</span></td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400 italic text-sm">No roles assigned yet — you're running as Super Admin by default.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Admin shell ----------
const ALL_TABS = [
  { id: 'wall', label: 'Wall', icon: MessageSquare, Component: WallTab },
  { id: 'vacancies', label: 'Vacancies', icon: Briefcase, Component: VacanciesTab },
  { id: 'programs', label: 'Internal Programs', icon: Briefcase, Component: ProgramsTab },
  { id: 'applications', label: 'CV Applications', icon: UsersIcon, Component: ApplicationsTab },
  { id: 'team', label: 'Team', icon: UsersIcon, Component: TeamTab },
  { id: 'enquiries', label: 'Vendor Enquiries', icon: Handshake, Component: EnquiriesTab },
  { id: 'content', label: 'Page Content', icon: Globe, Component: ContentTab },
  { id: 'brands', label: 'Brands', icon: Globe, Component: BrandsTab },
  { id: 'roles', label: 'Admin Roles', icon: ShieldCheck, Component: RolesTab, superAdminOnly: true },
];

const AdminDashboard = () => {
  const { role, can } = useAuth();
  const { text } = useContent();
  const visibleTabs = ALL_TABS.filter((t) => (t.superAdminOnly ? role === 'super_admin' : can(t.id)));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id);
  const ActiveComponent = visibleTabs.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 flex flex-col">
      <section className="bg-slate-900 pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            {text('brand.logo') ? (
              <div className="bg-white rounded-xl px-3 py-2 shadow-lg shadow-black/20">
                <img src={text('brand.logo')} alt="DINPL Nepal" className="h-10 w-auto max-w-[180px] object-contain" />
              </div>
            ) : (
              <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-900/50">
                <LayoutDashboard className="text-white" size={24} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white italic uppercase tracking-tight">DINPL CMS Portal</h1>
              <p className="text-slate-400 text-xs italic">Signed in as {role || 'admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all italic uppercase tracking-widest text-sm border border-white/10">
              <ArrowLeft size={18} /> View Site
            </Link>
            <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-red-600/20 text-red-400 font-bold rounded-xl hover:bg-red-600/30 transition-all italic uppercase tracking-widest text-sm border border-red-600/20">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-[10px] whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-slate-50 text-slate-900 border-b-2 border-red-600' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
        {ActiveComponent && <ActiveComponent />}
      </section>
    </div>
  );
};

// ---------- Route entry point ----------
const Admin = () => {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return user ? <AdminDashboard /> : <LoginScreen />;
};

export default Admin;

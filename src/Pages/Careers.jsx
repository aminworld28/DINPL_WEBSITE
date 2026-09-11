import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Briefcase, X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { getActiveVacancies, submitApplication } from '../lib/contentService';
import { uploadFile } from '../lib/uploadFile';

const ApplicationModal = ({ vacancy, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) { setError('Please attach your CV.'); return; }
    setStatus('submitting');
    setError('');
    try {
      const resumeUrl = await uploadFile(resumeFile, 'applications', 'cvs');
      await submitApplication({
        vacancy_id: vacancy.id,
        vacancy_title: vacancy.title,
        name: form.name, email: form.email, phone: form.phone, note: form.note,
        resume_url: resumeUrl,
      });
      setStatus('done');
    } catch (err) {
      // Our own validation messages (file type/size) are safe to show verbatim.
      // Anything else is a backend/network error that could contain internal
      // details, so show a generic message and keep the real one in the console.
      const knownMessage = /too large|Please (attach|upload)/.test(err.message) ? err.message : null;
      setError(knownMessage || 'Something went wrong submitting your application. Please try again.');
      console.error('Application submission failed:', err);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold italic uppercase">Apply</h3>
            <p className="text-xs text-slate-500 italic">{vacancy.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X size={24} /></button>
        </div>
        {status === 'done' ? (
          <div className="p-10 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-600" size={40} />
            <p className="font-bold text-slate-900 italic">Application received.</p>
            <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase italic">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
            <div className="grid grid-cols-2 gap-4">
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
            </div>
            <textarea rows={3} placeholder="Short note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none italic focus:ring-2 focus:ring-red-600" />
            <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-xl px-4 py-4 cursor-pointer hover:bg-slate-50">
              <Upload size={18} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 truncate">{resumeFile ? resumeFile.name : 'Attach your CV (PDF or Word, max 10MB)'}</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
            </label>
            {error && <p className="text-xs text-red-600 italic">{error}</p>}
            <button type="submit" disabled={status === 'submitting'}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white font-bold rounded-xl uppercase italic tracking-widest disabled:opacity-60">
              {status === 'submitting' && <Loader2 className="animate-spin" size={16} />}
              {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Careers = () => {
  const { text, programs } = useContent();
  const [vacancies, setVacancies] = useState([]);
  const [applyingTo, setApplyingTo] = useState(null);

  useEffect(() => {
    getActiveVacancies().then(setVacancies).catch(console.error);
  }, []);

  return (
    <div className="pb-24">
      <section className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 italic uppercase">{text('careers.hero.title', 'Join the Excellence')}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic">{text('careers.hero.subtitle')}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Internal Programs */}
        {programs.length > 0 && (
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-slate-900 italic mb-10 text-center">Internal Programs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((prog) => (
                <div key={prog.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {prog.image_url && <div className="h-40 overflow-hidden"><img src={prog.image_url} alt="" className="w-full h-full object-cover" /></div>}
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 italic mb-2">{prog.title}</h3>
                    <p className="text-slate-600 text-sm">{prog.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vacancies */}
        <h2 className="text-3xl font-bold text-slate-900 italic mb-10 text-center">Open Vacancies</h2>
        {vacancies.length === 0 ? (
          <p className="text-center text-slate-400 italic">No open positions right now — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {vacancies.map((v) => (
              <div key={v.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 italic">{v.title}</h3>
                  <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-bold uppercase px-3 py-1 rounded-full">{v.department}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
                  {v.location && <span className="flex items-center gap-1"><MapPin size={12} /> {v.location}</span>}
                  {v.employment_type && <span className="flex items-center gap-1"><Clock size={12} /> {v.employment_type}</span>}
                  {v.deadline && <span className="flex items-center gap-1"><Briefcase size={12} /> Apply by {v.deadline}</span>}
                </div>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{v.description}</p>
                {v.requirements && <p className="text-slate-500 text-xs italic mb-6">{v.requirements}</p>}
                <button onClick={() => setApplyingTo(v)} className="mt-auto w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-red-600 transition-colors uppercase italic tracking-widest text-xs">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {applyingTo && <ApplicationModal vacancy={applyingTo} onClose={() => setApplyingTo(null)} />}
    </div>
  );
};

export default Careers;

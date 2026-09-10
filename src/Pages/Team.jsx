import React, { useState, useEffect, useMemo } from 'react';
import { BriefcaseBusiness, Quote } from 'lucide-react';
import { useContent } from '../Context/ContentContext';
import { getTeamMembers } from '../lib/contentService';

const Team = () => {
  const { text } = useContent();
  const [members, setMembers] = useState([]);
  const [activeDept, setActiveDept] = useState('All');

  useEffect(() => {
    getTeamMembers().then(setMembers).catch(console.error);
  }, []);

  const departments = useMemo(() => {
    const set = new Set(members.map((m) => m.department).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [members]);

  const filtered = activeDept === 'All' ? members : members.filter((m) => m.department === activeDept);

  return (
    <div className="pb-24">
      <section className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 italic uppercase">{text('team.hero.title', 'Meet the Team')}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic">{text('team.hero.subtitle')}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {departments.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-14">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeDept === dept ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 italic">No team members added yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((m) => (
              <div key={m.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-[4/5] max-h-80 overflow-hidden relative bg-slate-100">
                  <img
                    src={m.image_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&auto=format&fit=crop'}
                    alt={m.name}
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  {m.linkedin_url && (
                    <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <BriefcaseBusiness size={14} />
                    </a>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-900 italic uppercase text-sm leading-tight mb-1">{m.name}</h4>
                  <p className="text-red-600 text-[9px] font-black uppercase tracking-widest mb-1">{m.role}</p>
                  <p className="text-slate-400 text-[9px] uppercase tracking-widest mb-3">{m.department}</p>
                  {m.quote && (
                    <div className="relative">
                      <Quote className="text-red-500/10 absolute -top-2 -left-1 rotate-180" size={20} />
                      <p className="text-slate-500 text-[11px] italic leading-relaxed pl-3 border-l-2 border-slate-100">{m.quote}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Team;

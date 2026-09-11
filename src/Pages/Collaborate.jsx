import React, { useState } from 'react';
import { Truck, Handshake, Box, FileCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { submitVendorEnquiry } from '../lib/contentService';

const Collaborate = () => {
  const { text } = useContent();
  const [form, setForm] = useState({ company_name: '', category: 'Raw Ingredients', contact_name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await submitVendorEnquiry(form);
      setStatus('done');
      setForm({ company_name: '', category: 'Raw Ingredients', contact_name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError('Something went wrong submitting your inquiry. Please try again.');
      console.error('Vendor enquiry submission failed:', err);
      setStatus('error');
    }
  };

  return (
    <div className="pb-24">
      <section className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 italic uppercase">{text('collaborate.hero.title', 'Collaborate With Us')}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic">{text('collaborate.hero.subtitle')}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <p className="text-slate-600 leading-relaxed italic text-lg">
              Our supply chain is the backbone of our quality promise. We invite local and international vendors who adhere to the highest standards of food safety, logistics, and reliability.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Logistics Partners', icon: Truck, desc: 'Efficient cold chain and delivery systems.' },
                { title: 'Quality Ingredients', icon: Box, desc: 'Supplying fresh, compliant food products.' },
                { title: 'Support Services', icon: Handshake, desc: 'Facility management and retail solutions.' },
                { title: 'Compliance Ready', icon: FileCheck, desc: 'Vendors must meet Yum! certification standards.' },
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <item.icon className="text-red-600 mb-4" size={28} />
                  <h4 className="font-bold text-slate-900 mb-2 italic">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed italic">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 italic uppercase tracking-tight">Vendor Inquiry Form</h3>
            {status === 'done' ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="mx-auto text-green-600" size={40} />
                <p className="font-bold text-slate-900 italic">Inquiry submitted.</p>
                <button onClick={() => setStatus('idle')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase italic">Submit another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Company Name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none">
                    <option>Raw Ingredients</option><option>Packaging</option><option>Logistics</option><option>IT/Technical</option><option>Other</option>
                  </select>
                </div>
                <input required placeholder="Contact Person" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
                  <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
                </div>
                <textarea required rows={4} placeholder="Brief proposal..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600" />
                {error && <p className="text-xs text-red-600 italic">{error}</p>}
                <button type="submit" disabled={status === 'submitting'}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg uppercase italic tracking-widest disabled:opacity-60">
                  {status === 'submitting' && <Loader2 className="animate-spin" size={16} />}
                  {status === 'submitting' ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collaborate;

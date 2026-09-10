import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useContent } from '../Context/ContentContext';

const Contact = () => {
  const { text } = useContent();

  return (
    <div className="pb-24">
      <section className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 italic uppercase">Contact Our Corporate Office</h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic">
          We are here to assist with corporate inquiries, stakeholder management, and general support.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-red-100 rounded-lg shrink-0"><MapPin className="text-red-600" size={20} /></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm italic mb-1">Address</h4>
              <p className="text-slate-500 text-sm italic leading-relaxed">{text('contact.address')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-red-100 rounded-lg shrink-0"><Phone className="text-red-600" size={20} /></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm italic mb-1">Phone</h4>
              <p className="text-slate-500 text-sm italic">{text('contact.phone')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-red-100 rounded-lg shrink-0"><Mail className="text-red-600" size={20} /></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm italic mb-1">Email</h4>
              <p className="text-slate-500 text-sm italic">{text('contact.email')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-3 bg-red-100 rounded-lg shrink-0"><Clock className="text-red-600" size={20} /></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm italic mb-1">Business Hours</h4>
              <p className="text-slate-500 text-sm italic">{text('contact.hours')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

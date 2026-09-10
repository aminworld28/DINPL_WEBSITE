import React from 'react';
import { Target, Eye } from 'lucide-react';
import { useContent } from '../Context/ContentContext';

const About = () => {
  const { text, brands } = useContent();

  return (
    <div className="pb-24">
      <section className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{text('about.hero.title', 'About Devyani International Nepal')}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">{text('about.hero.subtitle')}</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 italic">Our Heritage</h2>
          <p className="text-slate-600 leading-relaxed">{text('about.heritage.body')}</p>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Target className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 italic">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed italic">"{text('about.mission')}"</p>
          </div>
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Eye className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 italic">Our Vision</h3>
            <p className="text-slate-600 leading-relaxed italic">"{text('about.vision')}"</p>
          </div>
        </div>
      </section>

      {/* Brand portfolio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">
        <h2 className="text-3xl font-bold text-slate-900 italic text-center">Our International Portfolio</h2>
        {brands.length === 0 ? (
          <p className="text-center text-slate-400 italic">No brands added yet.</p>
        ) : (
          brands.map((brand, idx) => (
            <div key={brand.id} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-16 items-center`}>
              <div className="md:w-1/2">
                <div className="relative">
                  <img src={brand.image_url} alt={brand.name} className="rounded-3xl shadow-2xl w-full h-[400px] object-cover" />
                  <div className={`absolute -bottom-6 ${idx % 2 === 0 ? '-right-6' : '-left-6'} bg-white px-8 py-4 rounded-xl shadow-lg border border-slate-100`}>
                    <span className={`text-2xl font-black italic tracking-tighter ${brand.color?.replace('bg-', 'text-')}`}>{brand.name}</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-slate-900">{brand.tagline}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{brand.description}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default About;

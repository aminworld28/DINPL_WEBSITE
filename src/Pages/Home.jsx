import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MessageSquare, Handshake, ArrowRight, Leaf, Megaphone, Award, Newspaper } from 'lucide-react';
import { useContent } from '../Context/ContentContext';
import { getWallPosts } from '../lib/contentService';

const POST_META = {
  csr: { label: 'CSR', icon: Leaf, color: 'text-green-600' },
  aop: { label: 'AOP Event', icon: Megaphone, color: 'text-blue-500' },
  recognition: { label: 'Recognition', icon: Award, color: 'text-amber-500' },
  announcement: { label: 'Announcement', icon: Newspaper, color: 'text-red-500' },
};

const PILLARS = [
  { key: 'careers', to: '/careers', icon: Briefcase },
  { key: 'wall', to: '/wall', icon: MessageSquare },
  { key: 'collaborate', to: '/collaborate', icon: Handshake },
];

const Home = () => {
  const { text, stats, brands, loading } = useContent();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getWallPosts({ limit: 3 }).then(setPosts).catch(console.error);
  }, []);

  if (loading) return <div className="p-24 text-center italic text-slate-400">Loading...</div>;

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={text('home.hero.image')} alt="" className="w-full h-full object-cover brightness-[0.4]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {text('home.hero.title').split(' ').map((word, i) =>
                word.toLowerCase() === 'excellence' ? <span key={i} className="text-red-500"> {word} </span> : word + ' '
              )}
            </h1>
            <p className="text-xl text-slate-200 mb-8 leading-relaxed">{text('home.hero.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/about" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-center transition-all shadow-lg">Our Story</Link>
              <Link to="/careers" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-center backdrop-blur-md border border-white/20 transition-all">Join Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 -mt-32 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-500 text-sm font-medium uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid md:grid-cols-3 gap-8">
          {PILLARS.map((p) => (
            <Link key={p.key} to={p.to} className="group bg-slate-50 hover:bg-slate-900 p-10 rounded-3xl transition-all duration-300">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
                <p.icon className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white italic mb-3 transition-colors">
                {text(`home.pillars.${p.key}.title`)}
              </h3>
              <p className="text-slate-500 group-hover:text-slate-300 text-sm mb-6 transition-colors">
                {text(`home.pillars.${p.key}.desc`)}
              </p>
              <span className="text-red-600 group-hover:text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Explore <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Wall preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 italic">Latest on The Wall</h2>
            <p className="text-slate-500 text-sm">Recognition, events, and news from across DINPL.</p>
          </div>
          <Link to="/wall" className="text-red-600 font-bold text-sm hover:underline">View all →</Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-slate-400 italic text-sm">No posts yet — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => {
              const meta = POST_META[post.type] || POST_META.announcement;
              const Icon = meta.icon;
              return (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden border-l-4 border-l-red-600">
                  {post.image_url && <div className="h-40 overflow-hidden"><img src={post.image_url} alt="" className="w-full h-full object-cover" /></div>}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={meta.color} size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{post.title}</h3>
                    <p className="text-slate-600 text-sm italic line-clamp-3">{post.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Brand highlights */}
      {brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <h2 className="text-3xl font-bold text-slate-900 italic mb-10 text-center">Our Global Partnerships</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {brands.map((brand) => (
              <div key={brand.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <div className="h-48 overflow-hidden">
                  <img src={brand.image_url} alt={brand.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className={`inline-block px-3 py-1 rounded text-[10px] font-bold text-white uppercase mb-3 ${brand.color}`}>{brand.name}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{brand.tagline}</h3>
                  <Link to="/about" className="text-red-600 font-semibold text-sm">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

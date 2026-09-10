import React, { useState, useEffect } from 'react';
import { Leaf, Megaphone, Award, Newspaper, Heart } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { getWallPosts, likeWallPost } from '../lib/contentService';
import { getSessionId } from '../lib/sessionId';

const POST_TYPES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'csr', label: 'CSR', icon: Leaf },
  { id: 'aop', label: 'AOP Event', icon: Megaphone },
  { id: 'recognition', label: 'Recognition', icon: Award },
  { id: 'announcement', label: 'Announcement', icon: Newspaper },
];

const META = {
  csr: { color: 'text-green-600', icon: Leaf },
  aop: { color: 'text-blue-500', icon: Megaphone },
  recognition: { color: 'text-amber-500', icon: Award },
  announcement: { color: 'text-red-500', icon: Newspaper },
};

const Wall = () => {
  const { text } = useContent();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [likedIds, setLikedIds] = useState(new Set());

  const load = () => {
    getWallPosts({ type: filter === 'all' ? null : filter }).then(setPosts).catch(console.error);
  };

  useEffect(() => { load(); }, [filter]);

  const handleLike = async (post) => {
    if (likedIds.has(post.id)) return;
    const sessionId = getSessionId();
    const ok = await likeWallPost(post.id, sessionId).catch(() => false);
    if (ok) {
      setLikedIds((prev) => new Set(prev).add(post.id));
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likes_count: p.likes_count + 1 } : p)));
    }
  };

  return (
    <div className="pb-24">
      <section className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 italic uppercase">{text('wall.hero.title', 'The Wall')}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic">{text('wall.hero.subtitle')}</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-wrap gap-2 justify-center mb-14">
          {POST_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                filter === t.id ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-slate-400 italic">No posts in this category yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const meta = META[post.type] || META.announcement;
              const Icon = meta.icon;
              const liked = likedIds.has(post.id);
              return (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden border-l-4 border-l-red-600 flex flex-col md:flex-row">
                  {post.image_url && (
                    <div className="md:w-64 h-48 md:h-auto shrink-0 overflow-hidden">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={meta.color} size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{post.type}</span>
                        <span className="text-[10px] text-slate-300">· {new Date(post.publish_at).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => handleLike(post)}
                        className={`flex items-center gap-1 text-xs font-bold ${liked ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                      >
                        <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {post.likes_count}
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                    <p className="text-slate-600 text-sm italic leading-relaxed">{post.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Wall;

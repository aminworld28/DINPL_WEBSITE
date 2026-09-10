import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Camera, BriefcaseBusiness } from 'lucide-react';
import { useContent } from '../Context/ContentContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/careers', label: 'Careers' },
  { to: '/team', label: 'Team' },
  { to: '/wall', label: 'The Wall' },
  { to: '/collaborate', label: 'Collaborate' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { text } = useContent();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {text('brand.logo') ? (
              <img src={text('brand.logo')} alt="DINPL Nepal" className="h-11 w-auto max-w-[180px] object-contain" />
            ) : (
              <>
                <span className="text-2xl font-black italic tracking-tighter text-slate-900">dI</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">Nepal</span>
              </>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  location.pathname === item.to ? 'text-red-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/collaborate"
            className="hidden lg:inline-block px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
          >
            Collaborate
          </Link>

          <button className="lg:hidden text-slate-900" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 px-4 py-4 space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-bold uppercase tracking-widest ${
                  location.pathname === item.to ? 'text-red-600' : 'text-slate-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <h4 className="text-lg font-bold italic mb-4">Devyani International Nepal</h4>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              The quick-service restaurant leadership network powering KFC, Pizza Hut, and Creambell across Nepal.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" aria-label="Facebook" className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Globe size={16} /></a>
              <a href="#" aria-label="Instagram" className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Camera size={16} /></a>
              <a href="#" aria-label="LinkedIn" className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><BriefcaseBusiness size={16} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className="block text-slate-300 hover:text-white">{item.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Our Brands</h4>
            <div className="space-y-2 text-sm text-slate-300">
              <p>KFC</p>
              <p>Pizza Hut</p>
              <p>Creambell</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Corporate Office</h4>
            <div className="space-y-2 text-sm text-slate-300 italic">
              <p>{text('contact.address', 'Durbarmarg, Kathmandu, Nepal')}</p>
              <p>{text('contact.phone', '+977-1-422XXXX')}</p>
              <p>{text('contact.email', 'carrier.nepal@dil-rjcorp.com')}</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} Devyani International Nepal Pvt. Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

Layout.propTypes = { children: PropTypes.node.isRequired };

export default Layout;

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  getAllSiteContent, setSiteContent,
  getStats, replaceStats,
  getBrands,
  getInternalPrograms,
} from '../lib/contentService';

const ContentContext = createContext(null);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [stats, setStats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [contentData, statsData, brandsData, programsData] = await Promise.all([
        getAllSiteContent(),
        getStats(),
        getBrands(),
        getInternalPrograms(),
      ]);
      setContent(contentData);
      setStats(statsData);
      setBrands(brandsData);
      setPrograms(programsData);
    } catch (err) {
      console.error('Failed to load site content', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // text(key, fallback) — the single accessor every page uses to read editable copy
  const text = useCallback((key, fallback = '') => content[key] ?? fallback, [content]);

  const updateText = useCallback(async (key, value) => {
    await setSiteContent(key, value);
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateStats = useCallback(async (newStats) => {
    await replaceStats(newStats);
    await refresh();
  }, [refresh]);

  const value = { text, updateText, stats, updateStats, brands, programs, loading, error, refresh };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

ContentProvider.propTypes = { children: PropTypes.node.isRequired };

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside ContentProvider');
  return ctx;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { subscribeAuth, getAdminRole } from '../lib/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsub = subscribeAuth(async (u) => {
      setUser(u);
      if (u) {
        const r = await getAdminRole(u.id);
        // No role row yet = treat as super_admin (covers the first account you create)
        setRole(r ?? 'super_admin');
      } else {
        setRole(null);
      }
    });
    return unsub;
  }, []);

  // Permission helper: does the current admin have access to a given area?
  const can = (area) => {
    if (role === 'super_admin') return true;
    if (role === 'hr') return ['vacancies', 'applications', 'team', 'programs'].includes(area);
    if (role === 'content') return ['wall', 'about', 'brands', 'content', 'enquiries'].includes(area);
    return false;
  };

  return <AuthContext.Provider value={{ user, role, can }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAuth = () => useContext(AuthContext);

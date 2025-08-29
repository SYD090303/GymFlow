import React, { createContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext({ user: null, loading: true, logout: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (mounted) setUser(decoded);
      } catch (err) {
        if (mounted) setUser(null);
      }
    }
    if (mounted) setLoading(false);
    return () => { mounted = false; };
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/';
  };

  const value = useMemo(() => ({ user, loading, logout, setUser }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

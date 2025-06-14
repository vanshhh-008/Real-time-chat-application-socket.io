import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function RefreshHandler({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setIsAuthenticated(true);

      // Redirect only if user is on public pages
      const publicPaths = ['/', '/login', '/signup'];
      if (publicPaths.includes(location.pathname)) {
        navigate('/chats', { replace: true });
      }
    }
  }, [location.pathname, navigate, setIsAuthenticated]);

  return null;
}

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AUTH_ENDPOINTS } from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errors';

export const useLogin = (onClose) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth() || {};

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        email: email,
        password,
      });

      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('accessToken', token);
        // Decode and set user in context immediately to unblock ProtectedRoute
        try {
          const decoded = jwtDecode(token);
          setUser && setUser(decoded);
          const role = decoded?.role;
          // Role-based redirect for better UX
          if (role === 'RECEPTIONIST') {
            navigate('/dashboard/check-in', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } catch {
          // Fallback: go to dashboard; ProtectedRoute will re-check from storage
          navigate('/dashboard', { replace: true });
        }
        toast.success('Login successful!');
        onClose && onClose();
      } else {
        toast.error('Login failed: No access token received.');
      }
    } catch (error) {
      const reason = extractErrorMessage(error, 'Login failed');
      toast.error(`Login failed: ${reason}`);
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogin };
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminPanel from '../components/AdminPanel';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non‑admin users to home
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // If still loading or not admin, render nothing
  if (!user || user.role !== 'admin') {
    return null;
  }

  return <AdminPanel />;
}

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFullOptions } from '../../contexts/AuthContext';
import { getUserRole } from '../../contexts/AuthContext';
import Cookies from 'js-cookie';
import constants from '../../constants/index.js';
import Loading from '../../components/common/Loading';

export default function HomeClient() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuthFullOptions();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    if (token) {
      const role = getUserRole();
      // If user has employee role (not customer), redirect to admin
      if (role && role.startsWith("ROLE_")) {
        navigate("/admin", { replace: true });
      }
    }
  }, [navigate, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return <Loading fullScreen type="dots" />;
  }

  return (
    <div></div>
  );
}


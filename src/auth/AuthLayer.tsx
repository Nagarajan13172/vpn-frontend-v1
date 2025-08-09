import { Outlet, useNavigate } from 'react-router';
import { getAuthToken } from '../api/getAuthToken';
import { base_path } from '../api/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useUserStore } from '@/global/useUserStore';
import WifiLoader from '@/utils/Loader';


function AuthLayer() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const fetchUserData = async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      navigate('/auth/login', { replace: true });
      return { id: null, username: "", role: "" };
    }

    const response = await fetch(`${base_path}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);
      navigate('/auth/login', { replace: true });
      return { id: null, username: "", role: "" };
    }

    return response.json();
  };

  const { isLoading, data } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserData,
    enabled: true,
  });

  useEffect(() => {
    if (data?.id && data?.username && data?.role?.role) {
      setUser({
        id: data.id,
        username: data.username,
        role: data.role.role,
      });
    }
  }, [data, setUser]);

  if (user.id !== null && user.username !== "" && user.role !== "") {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <WifiLoader />
      </div>
    );
  }

  return <Outlet />;
}

export default AuthLayer;

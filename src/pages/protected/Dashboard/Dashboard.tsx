import { useTheme } from 'next-themes'; // Adjust based on your theme setup
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base_path } from '@/api/api';
import { getAuthToken } from '@/api/getAuthToken';
import { formatDataSize } from '@/utils/Formater';
import { Activity, BookOpenCheck, Plane, Users } from 'lucide-react'; // Icons as replacements
import { useUserStore } from '@/global/useUserStore';
import { useBreadcrumb } from '@/components/breadcrumb/BreadcrumbContext';
import { useEffect } from 'react';
import type { CurrentUser } from '@/types/user';

const shimmerAnimation = {
  initial: { opacity: 0.4 },
  animate: { opacity: [0.4, 1, 0.4] },
  transition: { duration: 1.5, repeat: Infinity },
};

interface DashboardData {
  peer_count: number;
  total_handshake: number;
  total_rx: number;
  total_tx: number;
  total_data: number;
}

// Function to fetch total peers (unchanged)
const fetchTotalPeers = async (userId: string) => {


  const authToken = getAuthToken();
  const response = await fetch(`${base_path}/api/peers/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch total peers.');
  }
  return response.json();
};

export default function Dashboard() {

  {
    /* BreadCrumbs */
  }
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      {
        label: (
          <div className="flex items-center gap-1">
            <BookOpenCheck className="h-4 w-4" />
            Home
          </div>
        ),
        href: "/home",
      },
      
    ]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  const { theme } = useTheme(); // Adjust based on your theme setup
  const { user } = useUserStore()

  // Fetch total peers (unchanged)
  useQuery({
    queryKey: ['totalPeers', user.id],
    queryFn: () => (user.id ? fetchTotalPeers(user.id) : Promise.reject('User ID is null')),
    enabled: !!user?.id,
  });

  const { isLoading, data } = useQuery<CurrentUser>({
    queryKey: ['user'],
    queryFn: async (): Promise<CurrentUser> => {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('No auth token found');
      const response = await fetch(`${base_path}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData.detail;
      }

      return response.json();
    },
  });

  const { data: dashboardData } = useQuery<DashboardData, Error>({
    queryKey: ['dashboard', user?.role],
    queryFn: async (): Promise<DashboardData> => {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('No auth token found');
      const endpoint = user?.role === 'admin'
        ? `${base_path}/api/peers/admin_dashboard`
        : `${base_path}/api/peers/dashboard`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch dashboard data');
      }

      return response.json();
    },
    enabled: !!user, // Only fetch when user is available
  });

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg shadow-md bg-card">
        {isLoading ? (
          <motion.div
            className="skeleton-circle"
            {...shimmerAnimation}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: theme === 'dark' ? '#444' : '#e0e0e0',
            }}
          />
        ) : (
          <Users className="h-10 w-10 text-green-500" />
        )}
        <div>
          <h3 className="text-sm text-muted-foreground">Welcome!</h3>
          {isLoading ? (
            <motion.div
              className="skeleton-text"
              {...shimmerAnimation}
              style={{
                width: 200,
                height: 32,
                backgroundColor: theme === 'dark' ? '#444' : '#e0e0e0',
              }}
            />
          ) : (
            <h1 className="text-2xl font-bold text-foreground">{data?.username}</h1>
          )}
        </div>
      </div>

      <hr className="my-4 border-t border-border" /> {/* Divider */}

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Connected Peers', value: dashboardData?.peer_count, total: dashboardData?.total_handshake, icon: <Activity className="h-6 w-6" /> },
          { title: 'Total Usage', value: dashboardData?.total_data, icon: <Plane className="h-6 w-6" /> },
          { title: 'Total Received', value: dashboardData?.total_rx, icon: <Plane className="h-6 w-6 rotate-90" /> },
          { title: 'Total Sent', value: dashboardData?.total_tx, icon: <Plane className="h-6 w-6 -rotate-90" /> },
        ].map((item, index) => (
          <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-2xl font-semibold text-foreground">
                    {item.title === 'Connected Peers'
                      ? `${item.value}/${item.total}`
                      : formatDataSize(item.value || 0)}
                  </p>
                )}
              </div>
              <div className="text-muted-foreground">{item.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
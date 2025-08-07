"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { base_path } from "@/api/api"
import { getAuthToken } from "@/api/getAuthToken"
import { formatDataSize } from "@/utils/Formater"
import { Activity, BookOpenCheck, Plane, Users } from "lucide-react"
import { useUserStore } from "@/global/useUserStore"
import { useBreadcrumb } from "@/components/breadcrumb/BreadcrumbContext"
import React, { useEffect, useMemo, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import type { CurrentUser } from "@/types/user"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend)

interface DashboardData {
  peer_count: number
  total_handshake: number
  total_rx: number
  total_tx: number
  total_data: number
}

const shimmerAnimation = {
  initial: { opacity: 0.4 },
  animate: { opacity: [0.4, 1, 0.4] },
  transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
}

const fetchTotalPeers = async (userId: string) => {
  const authToken = getAuthToken()
  const response = await fetch(`${base_path}/api/peers/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || "Failed to fetch total peers.")
  }
  return response.json()
}

export default function Dashboard() {
  const { setBreadcrumbs } = useBreadcrumb()
  const { theme } = useTheme()
  const { user } = useUserStore()

  const [rxTotalHistory, setRxTotalHistory] = useState<number[]>([])
  const [txTotalHistory, setTxTotalHistory] = useState<number[]>([])
  const [peers, setPeers] = useState<any[]>([])
  const [rxHistory, setRxHistory] = useState<{ [peerId: string]: number[] }>({})
  const [txHistory, setTxHistory] = useState<{ [peerId: string]: number[] }>({})

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
    ])
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs])

  const { data: totalPeersData } = useQuery({
    queryKey: ["totalPeers", user.id],
    queryFn: () => (user.id ? fetchTotalPeers(user.id) : Promise.reject("User ID is null")),
    enabled: !!user?.id,
    refetchInterval: 1000,
  })

  useEffect(() => {
    if (totalPeersData) {
      setPeers(totalPeersData || [])
    }
  }, [totalPeersData])

  const { isLoading, data } = useQuery<CurrentUser>({
    queryKey: ["user"],
    queryFn: async (): Promise<CurrentUser> => {
      const authToken = getAuthToken()
      if (!authToken) throw new Error("No auth token found")
      const response = await fetch(`${base_path}/api/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail)
      }
      return response.json()
    },
  })

  const { data: dashboardData } = useQuery<DashboardData, Error>({
    queryKey: ["dashboard", user?.role],
    queryFn: async (): Promise<DashboardData> => {
      const authToken = getAuthToken()
      const endpoint =
        user?.role === "admin"
          ? `${base_path}/api/peers/admin_dashboard`
          : `${base_path}/api/peers/dashboard`
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch dashboard data")
      }
      return response.json()
    },
    enabled: !!user,
    refetchInterval: 1000,
  })

  // Update per-peer history
  useEffect(() => {
    // Initialize history states when peers are available
    if (peers.length) {
      const newRxHistory: { [peerId: string]: number[] } = {};
      const newTxHistory: { [peerId: string]: number[] } = {};

      peers.forEach((peer) => {
        // Initialize history with the current raw RX/TX values
        newRxHistory[peer.id] = [(rxHistory[peer.id]?.length ? rxHistory[peer.id] : []).slice(-8), peer.rx].flat();
        newTxHistory[peer.id] = [(txHistory[peer.id]?.length ? txHistory[peer.id] : []).slice(-8), peer.tx].flat();
      });

      setRxHistory(newRxHistory);
      setTxHistory(newTxHistory);
    }

    // Set up interval for continuous updates
    const interval = setInterval(() => {
      if (!peers.length) return;

      setRxHistory((prev) => {
        const newHistory = { ...prev };
        peers.forEach((peer) => {
          // Append the raw RX value
          newHistory[peer.id] = [...(newHistory[peer.id] || []).slice(-8), peer.rx];
        });
        return newHistory;
      });

      setTxHistory((prev) => {
        const newHistory = { ...prev };
        peers.forEach((peer) => {
          // Append the raw TX value
          newHistory[peer.id] = [...(newHistory[peer.id] || []).slice(-8), peer.tx];
        });
        return newHistory;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [peers]);

  // Update RX/TX total history every second
  useEffect(() => {
    if (!dashboardData) return;
    const interval = setInterval(() => {
      setRxTotalHistory((prev) => [...prev.slice(-8), dashboardData.total_rx || 0]);
      setTxTotalHistory((prev) => [...prev.slice(-8), dashboardData.total_tx || 0]);
    }, 1000);
    return () => clearInterval(interval);
  }, [dashboardData]);

  const labels = useMemo(() => Array.from({ length: 9 }, (_, i) => `${i + 1}s`), [])
  const maxVal = useMemo(() => {
    const values = [...rxTotalHistory, ...txTotalHistory].filter((v) => !isNaN(v) && v > 0)
    return values.length ? Math.max(...values) : 1000 // Fallback to avoid zero max
  }, [rxTotalHistory, txTotalHistory])

  const lineChartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutCubic", // ✅ now recognized by TypeScript
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
        titleColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        bodyColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.raw) || 0;
            const label = ctx.dataset.label;
            return `${label}: ${formatDataSize(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: theme === "dark" ? "#9ca3af" : "#6b7280",
        },
      },
      y: {
        display: true,
        grid: {
          color: theme === "dark" ? "#374151" : "#e5e7eb",
        },
        ticks: {
          color: theme === "dark" ? "#9ca3af" : "#6b7280",
          callback: function (this, tickValue: string | number) {
            // Only format if tickValue is a number
            return typeof tickValue === "number" ? formatDataSize(tickValue) : tickValue;
          },
        },
        suggestedMax: maxVal * 1.2,
        beginAtZero: true,
      },
    },
  }), [maxVal, theme])

  const rxChartData = {
    labels,
    datasets: [
      {
        label: "RX",
        data: rxTotalHistory.length ? rxTotalHistory : Array(9).fill(0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: false,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const txChartData = {
    labels,
    datasets: [
      {
        label: "TX",
        data: txTotalHistory.length ? txTotalHistory : Array(9).fill(0),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: false,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const combinedChartData = {
    labels,
    datasets: [
      {
        label: "RX",
        data: rxTotalHistory.length ? rxTotalHistory : Array(9).fill(0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: false,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "TX",
        data: txTotalHistory.length ? txTotalHistory : Array(9).fill(0),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: false,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const cardItems = [
    {
      title: "Connected Peers",
      value: dashboardData?.peer_count,
      total: dashboardData?.total_handshake,
      icon: <Users className="text-blue-500" />,
      borderColor: "border-blue-500",
      iconBgColor: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      title: "Total Usage",
      value: dashboardData?.total_data,
      icon: <Activity className="text-purple-500" />,
      borderColor: "border-purple-500",
      iconBgColor: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      title: "Total Received",
      value: dashboardData?.total_rx,
      icon: <Plane className="text-green-500 -rotate-45" />,
      borderColor: "border-green-500",
      iconBgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      title: "Total Sent",
      value: dashboardData?.total_tx,
      icon: <Plane className="text-red-500 rotate-45" />,
      borderColor: "border-red-500",
      iconBgColor: "bg-red-100 dark:bg-red-900/50",
    },
  ]

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl shadow-lg bg-card border-l-4 border-blue-500">
        {isLoading ? (
          <motion.div
            className="skeleton-circle"
            {...shimmerAnimation}
            style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: theme === "dark" ? "#444" : "#e0e0e0" }}
          />
        ) : (
          <Users className="h-10 w-10 text-blue-500" />
        )}
        <div>
          <h3 className="text-sm text-muted-foreground">Welcome!</h3>
          {isLoading ? (
            <motion.div
              className="skeleton-text"
              {...shimmerAnimation}
              style={{ width: 200, height: 32, backgroundColor: theme === "dark" ? "#444" : "#e0e0e0" }}
            />
          ) : (
            <h1 className="text-2xl font-bold text-foreground">{data?.username}</h1>
          )}
        </div>
      </div>

      <hr className="my-6 border-t border-border" />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((item, index) => (
          <Card
            key={index}
            className={`relative bg-card rounded-xl shadow-lg border-l-4 ${item.borderColor} hover:shadow-xl transition-shadow duration-300`}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      {item.title === "Connected Peers"
                        ? `${item.value ?? 0} / ${item.total ?? 0}`
                        : formatDataSize(item.value || 0)}
                    </>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${item.iconBgColor}`}>
                {React.cloneElement(item.icon, { className: `${item.icon.props.className} h-8 w-8` })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="relative bg-card rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <Line data={rxChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="relative bg-card rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <Line data={txChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="relative bg-card rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Total RX/TX Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <Line data={combinedChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
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
import { Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js"
import type { CurrentUser } from "@/types/user"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend)

const shimmerAnimation = {
  initial: { opacity: 0.4 },
  animate: { opacity: [0.4, 1, 0.4] },
  transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
}

interface DashboardData {
  peer_count: number
  total_handshake: number
  total_rx: number
  total_tx: number
  total_data: number
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
    return () => {
      setBreadcrumbs([])
    }
  }, [setBreadcrumbs])

  const { theme } = useTheme()
  const { user } = useUserStore()

  // State for RX and TX history
  const [rxTotalHistory, setRxTotalHistory] = useState<number[]>([])
  const [txTotalHistory, setTxTotalHistory] = useState<number[]>([])

  // Fetch total peers
  useQuery({
    queryKey: ["totalPeers", user.id],
    queryFn: () => (user.id ? fetchTotalPeers(user.id) : Promise.reject("User ID is null")),
    enabled: !!user?.id,
  })

  // Fetch user data
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
        throw errorData.detail
      }
      return response.json()
    },
  })

  // Fetch dashboard data
  const { data: dashboardData } = useQuery<DashboardData, Error>({
    queryKey: ["dashboard", user?.role],
    queryFn: async (): Promise<DashboardData> => {
      const authToken = getAuthToken()
      if (!authToken) throw new Error("No auth token found")
      const endpoint =
        user?.role === "admin" ? `${base_path}/api/peers/admin_dashboard` : `${base_path}/api/peers/dashboard`
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
      const data = await response.json()
      console.log("Dashboard Data:", data)
      return data
    },
    enabled: !!user,
    refetchInterval: 1000,
  })

  // Update RX and TX history
  useEffect(() => {
    if (!dashboardData) return
    setRxTotalHistory((prev) => {
      const newHistory = [...prev.slice(-8), dashboardData.total_rx || 0].slice(-9)
      console.log("Dashboard - rxTotalHistory:", newHistory)
      return newHistory
    })
    setTxTotalHistory((prev) => {
      const newHistory = [...prev.slice(-8), dashboardData.total_tx || 0].slice(-9)
      console.log("Dashboard - txTotalHistory:", newHistory)
      return newHistory
    })
  }, [dashboardData])

  // Chart data and options for line charts
  const labels = useMemo(() => Array.from({ length: 9 }, (_, i) => `${i + 1}`), [])
  const maxVal = useMemo(() => {
    const validValues = [...rxTotalHistory, ...txTotalHistory].filter((val) => typeof val === "number" && !isNaN(val))
    const max = validValues.length > 0 ? Math.max(...validValues) : 1
    console.log("Dashboard - Max Value (Line Charts):", max)
    return max
  }, [rxTotalHistory, txTotalHistory])

  const rxChartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "RX",
          data: rxTotalHistory.length
            ? rxTotalHistory.map((val) => (typeof val === "number" && !isNaN(val) ? val : 0))
            : Array(9).fill(0),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    }),
    [rxTotalHistory, labels],
  )

  const txChartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "TX",
          data: txTotalHistory.length
            ? txTotalHistory.map((val) => (typeof val === "number" && !isNaN(val) ? val : 0))
            : Array(9).fill(0),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    }),
    [txTotalHistory, labels],
  )

  const lineChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 100,
        easing: "linear",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: "nearest",
          intersect: false,
          position: "nearest",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          padding: 8,
          caretPadding: 8,
          cornerRadius: 4,
          callbacks: {
            label: (context: any) => {
              const value = Number(context.raw)
              const label = context.dataset.label || ""
              const formatted = formatDataSize(value)
              console.log(`Dashboard Line Tooltip - ${label}: ${formatted}`)
              return `${label}: ${formatted}`
            },
          },
        },
      },
      scales: {
        x: { display: false },
        y: {
          display: false,
          suggestedMax: maxVal * 1.1,
          beginAtZero: true,
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
    }),
    [maxVal],
  )

  // Pie chart data for Total Usage (RX + TX)
  const pieChartData = useMemo(
    () => ({
      labels: ["RX", "TX"],
      datasets: [
        {
          label: "Total Usage",
          data: [dashboardData?.total_rx || 0, dashboardData?.total_tx || 0].map((val) =>
            typeof val === "number" && !isNaN(val) ? val : 0,
          ),
          backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
          borderColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
          borderWidth: 1,
        },
      ],
    }),
    [dashboardData],
  )

  const pieChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            font: { size: 12 },
            color: theme === "dark" ? "#fff" : "#000",
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          padding: 8,
          caretPadding: 8,
          cornerRadius: 4,
          callbacks: {
            label: (context: any) => {
              const value = Number(context.raw)
              const label = context.label || ""
              const total = dashboardData?.total_data || 0
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              const formatted = formatDataSize(value)
              console.log(`Dashboard Pie Tooltip - ${label}: ${formatted} (${percentage}%)`)
              return `${label}: ${formatted} (${percentage}%)`
            },
          },
        },
      },
    }),
    [dashboardData, theme],
  )

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
              borderRadius: "50%",
              backgroundColor: theme === "dark" ? "#444" : "#e0e0e0",
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
                backgroundColor: theme === "dark" ? "#444" : "#e0e0e0",
              }}
            />
          ) : (
            <h1 className="text-2xl font-bold text-foreground">{data?.username}</h1>
          )}
        </div>
      </div>
      <hr className="my-4 border-t border-border" />

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardItems.map((item, index) => (
          <Card key={index} className={`border-l-4 ${item.borderColor} bg-card transition-shadow hover:shadow-md`}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <div className="text-2xl font-bold mt-1">
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

      {/* Total Usage Pie Chart */}
      <div className="mt-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Total Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex items-center justify-center">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RX and TX Line Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Total Received Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[100px] w-full">
              <Line data={rxChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Total Sent Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[100px] w-full">
              <Line data={txChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

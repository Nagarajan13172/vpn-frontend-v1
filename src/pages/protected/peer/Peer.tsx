import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Download, MoreVertical, Plus, Wifi, WifiOff } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Peer } from "../../../lib/type"
import { formatBytes } from "@/lib/utils"

const peersData: Peer[] = [
  {
    name: "Hari",
    status: "online",
    lastSeen: "1 minute ago",
    ipAddress: "10.5.0.21",
    endPoint: "157.51.94.237",
    upload: 1835008,
    download: 24127488,
    trafficData: [
      { time: "1m", upload: 500, download: 1200 },
      { time: "5m", upload: 800, download: 1800 },
      { time: "10m", upload: 1200, download: 2200 },
      { time: "15m", upload: 1500, download: 2800 },
      { time: "20m", upload: 1800, download: 3500 },
      { time: "25m", upload: 2200, download: 4100 },
      { time: "30m", upload: 2500, download: 4800 },
    ],
  },
  {
    name: "Oneplus",
    status: "online",
    lastSeen: "1 minute ago",
    ipAddress: "10.5.0.19",
    endPoint: "157.51.89.110",
    upload: 13516,
    download: 32358,
    trafficData: [
      { time: "1m", upload: 100, download: 200 },
      { time: "5m", upload: 150, download: 300 },
      { time: "10m", upload: 200, download: 400 },
      { time: "15m", upload: 250, download: 500 },
      { time: "20m", upload: 300, download: 600 },
      { time: "25m", upload: 350, download: 700 },
      { time: "30m", upload: 400, download: 800 },
    ],
  },
  {
    name: "Labs",
    status: "online",
    lastSeen: "48 seconds ago",
    ipAddress: "10.5.0.35",
    endPoint: "194.238.17.61",
    upload: 21495808,
    download: 1216348,
    trafficData: [
      { time: "1m", upload: 2000, download: 100 },
      { time: "5m", upload: 3000, download: 150 },
      { time: "10m", upload: 4000, download: 200 },
      { time: "15m", upload: 5000, download: 250 },
      { time: "20m", upload: 6000, download: 300 },
      { time: "25m", upload: 7000, download: 350 },
      { time: "30m", upload: 8000, download: 400 },
    ],
  },
  {
    name: "Tuf",
    status: "offline",
    lastSeen: "Never",
    ipAddress: "10.5.0.40",
    endPoint: null,
    upload: 0,
    download: 0,
    trafficData: [
      { time: "1m", upload: 0, download: 0 },
      { time: "5m", upload: 0, download: 0 },
      { time: "10m", upload: 0, download: 0 },
      { time: "15m", upload: 0, download: 0 },
      { time: "20m", upload: 0, download: 0 },
      { time: "25m", upload: 0, download: 0 },
      { time: "30m", upload: 0, download: 0 },
    ],
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="label text-sm text-muted-foreground">{`Time: ${label}`}</p>
        <p className="intro text-sm text-blue-500">{`Upload: ${formatBytes(payload[0].value)}`}</p>
        <p className="intro text-sm text-red-500">{`Download: ${formatBytes(payload[1].value)}`}</p>
      </div>
    )
  }
  return null
}

const PeerCard = ({ peer }: { peer: Peer }) => {
  const isOnline = peer.status === "online"
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{peer.name}</CardTitle>
            <CardDescription className="text-sm">{peer.lastSeen}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1.5">
              {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Disconnect</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Remove Peer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">IP Address:</span>
            <span className="font-mono">{peer.ipAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Endpoint:</span>
            <span className="font-mono">{peer.endPoint || "(none)"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-4">
        <div className="w-full h-24 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={peer.trafficData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatBytes(value as number)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="upload"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorUpload)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="download"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorDownload)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-muted-foreground">Upload</div>
              <div className="font-semibold">{formatBytes(peer.upload)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-muted-foreground">Download</div>
              <div className="font-semibold">{formatBytes(peer.download)}</div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function PeersDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Peers</h1>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Peer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {peersData.map((peer) => (
          <PeerCard key={peer.name} peer={peer} />
        ))}
      </div>
    </div>
  )
}

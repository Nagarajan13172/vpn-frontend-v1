export interface Peer {
  name: string
  status: "online" | "offline"
  lastSeen: string
  ipAddress: string
  endPoint: string | null
  upload: number
  download: number
  trafficData: {
    time: string
    upload: number
    download: number
  }[]
}
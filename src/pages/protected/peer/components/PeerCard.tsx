// import { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { MoreVertical, Wifi, WifiOff, Download, Upload, Activity } from 'lucide-react';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// interface PeerData {
//   id: string;
//   name: string;
//   ipAddress: string;
//   endpoint: string;
//   uploadSpeed: number;
//   downloadSpeed: number;
//   totalUploaded: string;
//   totalDownloaded: string;
//   status: 'online' | 'offline' | 'connecting';
//   lastSeen: string;
//   latency: number;
// }

// interface PeerCardProps {
//   peer: PeerData;
//   index: number;
// }

// export function PeerCard({ peer, index }: PeerCardProps) {
//   const [uploadData, setUploadData] = useState<number[]>([]);
//   const [downloadData, setDownloadData] = useState<number[]>([]);

//   useEffect(() => {
//     // Simulate real-time data updates
//     const interval = setInterval(() => {
//       setUploadData(prev => {
//         const newData = [...prev, Math.random() * peer.uploadSpeed];
//         return newData.slice(-20); // Keep last 20 data points
//       });
      
//       setDownloadData(prev => {
//         const newData = [...prev, Math.random() * peer.downloadSpeed];
//         return newData.slice(-20); // Keep last 20 data points
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [peer.uploadSpeed, peer.downloadSpeed]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'online':
//         return 'bg-success';
//       case 'connecting':
//         return 'bg-warning';
//       case 'offline':
//         return 'bg-destructive';
//       default:
//         return 'bg-muted';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'online':
//         return <Wifi className="h-4 w-4" />;
//       case 'connecting':
//         return <Activity className="h-4 w-4 animate-pulse" />;
//       case 'offline':
//         return <WifiOff className="h-4 w-4" />;
//       default:
//         return <WifiOff className="h-4 w-4" />;
//     }
//   };

//   const MiniChart = ({ data, color }: { data: number[]; color: string }) => {
//     const maxValue = Math.max(...data, 1);
    
//     return (
//       <div className="h-12 w-full flex items-end gap-1">
//         {data.map((value, idx) => (
//           <div
//             key={idx}
//             className={`w-1  transition-all duration-300 ${color}`}
//             style={{
//               height: `${(value / maxValue) * 100}%`,
//               minHeight: '2px'
//             }}
//           />
//         ))}
//       </div>
//     );
//   };

//   return (
//     <Card 
//       className="group relative overflow-hidden  border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in"
//       style={{ animationDelay: `${index * 100}ms` }}
//     >
//       {/* Animated background overlay */}
//       <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
//       <div className="relative p-6">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className={`w-3 h-3 rounded-full ${getStatusColor(peer.status)} ${
//               peer.status === 'online' ? 'animate-pulse-glow' : ''
//             }`} />
//             <div>
//               <h3 className="font-semibold text-foreground group-hover:text-primary-foreground transition-colors">
//                 {peer.name}
//               </h3>
//               <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">
//                 {peer.lastSeen}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-2">
//             <Badge variant="secondary" className="text-xs">
//               {peer.latency}ms
//             </Badge>
            
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <MoreVertical className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>Connect</DropdownMenuItem>
//                 <DropdownMenuItem>Disconnect</DropdownMenuItem>
//                 <DropdownMenuItem>View Details</DropdownMenuItem>
//                 <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Connection Info */}
//         <div className="space-y-2 mb-4">
//           <div className="flex justify-between text-sm">
//             <span className="text-muted-foreground">IP Address:</span>
//             <span className="font-mono text-foreground">{peer.ipAddress}</span>
//           </div>
//           <div className="flex justify-between text-sm">
//             <span className="text-muted-foreground">Endpoint:</span>
//             <span className="font-mono text-foreground truncate max-w-32" title={peer.endpoint}>
//               {peer.endpoint}
//             </span>
//           </div>
//         </div>

//         {/* Transfer Stats */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div className="space-y-2">
//             <div className="flex items-center gap-2 text-sm">
//               <Upload className="h-4 w-4 text-success" />
//               <span className="text-muted-foreground">Upload</span>
//             </div>
//             <div className="text-lg font-semibold text-success">{peer.totalUploaded}</div>
//             <MiniChart data={uploadData} color="from-success/20 to-success" />
//           </div>
          
//           <div className="space-y-2">
//             <div className="flex items-center gap-2 text-sm">
//               <Download className="h-4 w-4 text-info" />
//               <span className="text-muted-foreground">Download</span>
//             </div>
//             <div className="text-lg font-semibold text-info">{peer.totalDownloaded}</div>
//             <MiniChart data={downloadData} color="from-info/20 to-info" />
//           </div>
//         </div>

//         {/* Status Badge */}
//         <div className="flex items-center justify-between">
//           <Badge variant={peer.status === 'online' ? 'default' : 'secondary'} className="gap-2">
//             {getStatusIcon(peer.status)}
//             {peer.status.charAt(0).toUpperCase() + peer.status.slice(1)}
//           </Badge>
          
//           <div className="flex items-center gap-2 text-xs text-muted-foreground">
//             <span>{peer.uploadSpeed.toFixed(1)} KB/s ↑</span>
//             <span>{peer.downloadSpeed.toFixed(1)} KB/s ↓</span>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Plus, Download, Search, Filter, Wifi } from 'lucide-react';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// interface PeersHeaderProps {
//   totalPeers: number;
//   onlinePeers: number;
//   searchQuery: string;
//   onSearchChange: (query: string) => void;
//   onAddPeer: () => void;
//   onDownloadAll: () => void;
// }

// export function PeersHeader({ 
//   totalPeers, 
//   onlinePeers, 
//   searchQuery, 
//   onSearchChange, 
//   onAddPeer, 
//   onDownloadAll 
// }: PeersHeaderProps) {
//   return (
//     <div className="space-y-6">
//       {/* Main Header */}
//       <div className="flex items-center justify-between">
//         <div className="space-y-2">
//           <h1 className="text-3xl font-bold ">
//             Network Peers
//           </h1>
//           <div className="flex items-center gap-4">
//             <Badge variant="outline" className="gap-2">
//               <Wifi className="h-4 w-4 text-success" />
//               {onlinePeers} / {totalPeers} Online
//             </Badge>
//             <span className="text-sm text-muted-foreground">
//               Last updated: {new Date().toLocaleTimeString()}
//             </span>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <Button onClick={onDownloadAll} variant="outline" className="gap-2">
//             <Download className="h-4 w-4" />
//             Download All
//           </Button>
//           <Button onClick={onAddPeer} className="gap-2 bg-gradient-accent hover:opacity-90 text-primary-foreground">
//             <Plus className="h-4 w-4" />
//             Add Peer
//           </Button>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="flex items-center gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
//           <Input
//             placeholder="Search peers by name, IP, or endpoint..."
//             value={searchQuery}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="pl-10  border-border/50 focus:border-primary/50"
//           />
//         </div>
        
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" className="gap-2">
//               <Filter className="h-4 w-4" />
//               Filter
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem>All Peers</DropdownMenuItem>
//             <DropdownMenuItem>Online Only</DropdownMenuItem>
//             <DropdownMenuItem>High Traffic</DropdownMenuItem>
//             <DropdownMenuItem>Recently Added</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   );
// }
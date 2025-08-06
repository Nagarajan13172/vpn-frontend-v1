import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, MoreVertical, Plus, Wifi, WifiOff, ArrowUp, ArrowDown, BookOpenCheck, PauseCircle, PlayCircle, Eye, SquarePen, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/api/getAuthToken';
import { base_path } from '@/api/api';
import { useUserStore } from '@/global/useUserStore';
import { toast } from 'sonner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { formatDataSize, formatTimeAgo, peerStatus } from '@/utils/Formater';
import { useNavigate } from 'react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useBreadcrumb } from '@/components/breadcrumb/BreadcrumbContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

interface PeersData {
  id: string;
  peer_name: string;
  assigned_ip: string;
  endpoint: string;
  latest_handshake: string | number;
  rx: number;
  tx: number;
  user_id: string;
  username?: string;
}

const PeerCard = ({ peer, onPause, onDelete, onEdit, rxHistory, txHistory }: {
  peer: PeersData;
  onDelete: (peer: PeersData) => void;
  onEdit: (peer: PeersData) => void;
  onPause: (peer: PeersData) => void;
  rxHistory: number[];
  txHistory: number[]
}) => {
  const labels = rxHistory.map((_, i) => i + 1); // Safer than fill('')

  const rxChartData = {
    labels,
    datasets: [
      {
        label: 'RX',
        data: rxHistory.length ? rxHistory : Array(8).fill(0),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const txChartData = {
    labels,
    datasets: [
      {
        label: 'TX',
        data: txHistory.length ? txHistory : Array(8).fill(0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'linear',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        callbacks: {
          label: (tooltipItem: import('chart.js').TooltipItem<'line'>) =>
            `${tooltipItem.dataset.label}: ${formatDataSize(Number(tooltipItem.raw))}`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-0 ">
      <CardHeader>
        <div className="flex items-start justify-between pb-2 border-b-2">
          <div>
            <CardTitle className="text-sm font-semibold">{peer.peer_name}</CardTitle>
            <CardDescription className="text-xs">{formatTimeAgo(peer.latest_handshake)}</CardDescription>
          </div>
          <div className="flex items-center gap-2 ">
            <Badge
              className={`flex items-center gap-1.5 text-white ${peerStatus(Number(peer.latest_handshake))
                ? 'bg-green-600'
                : 'bg-red-600'
                }`}
            >
              {peerStatus(Number(peer.latest_handshake)) ? (
                <Wifi className="h-3.5 w-3.5 text-white" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-white" />
              )}
              {peerStatus(Number(peer.latest_handshake)) ? '' : ''}
            </Badge>

            <span
              className="cursor-pointer  text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onPause(peer);
              }}
            >
              {peerStatus(Number(peer.latest_handshake)) ? (
                <>
                  <PauseCircle className="h-6 w-6" />
                </>
              ) : (
                <>
                  <PlayCircle className="h-6 w-6" />
                </>
              )}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 border-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='border-2'>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/peers/${peer.id}`); }}>
                  <Eye />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(peer); }}>
                  <SquarePen />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(peer)}>
                  <Trash2 />
                  Delete Peer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </CardHeader>
      <CardContent className="">
        <div className=" text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">IP Address:</span>
            <span className="font-mono">{peer.assigned_ip}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Endpoint:</span>
            <span className="font-mono">{peer.endpoint?.split(':')[0] || '(none)'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col border-2 m-2 rounded-xl">
        <div className="w-full flex justify-between gap-4 text-sm p-2">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-blue-500" />
            <div>
              {/* <div className="text-muted-foreground">Upload</div> */}
              <div className="font-semibold">{formatDataSize(peer.rx)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <div>
              {/* <div className="text-muted-foreground">Download</div> */}
              <div className="font-semibold">{formatDataSize(peer.tx)}</div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between">
          <div className="h-[50px] w-[100px]">
            <Line data={rxChartData} options={chartOptions} />
          </div>
          <div className="h-[50px] w-[100px]">
            <Line data={txChartData} options={chartOptions} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p className="py-4">Are you sure you want to delete this peer?</p>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm} disabled={false}>
            Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function PeersDashboard() {

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
            Peers
          </div>
        ),
        href: "/Peers",
      },
    ]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeersData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isAutoIP, setIsAutoIP] = useState(false);
  const [rxHistory, setRxHistory] = useState<{ [key: string]: number[] }>({});
  const [txHistory, setTxHistory] = useState<{ [key: string]: number[] }>({});
  const [expandedUsernames, setExpandedUsernames] = useState<Set<string>>(new Set());
  const { user } = useUserStore();
  const queryClient = useQueryClient();


  const { data: peers = [], isLoading, error } = useQuery<PeersData[]>({
    queryKey: ['peers', user?.role],
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      const endpoint = user?.role === 'admin' ? `${base_path}/api/peers/admin_peers` : `${base_path}/api/peers`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to fetch peers.');
      }
      return response.json();
    },
    refetchInterval: 1000,
    retry: 3,
    enabled: !!user?.id,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!peers.length) return;

      setRxHistory((prev) => {
        const newHistory = { ...prev };
        peers.forEach((peer) => {
          const currentHistory = newHistory[peer.id] || [];
          newHistory[peer.id] = [...currentHistory.slice(-8), peer.rx];
        });
        return newHistory;
      });

      setTxHistory((prev) => {
        const newHistory = { ...prev };
        peers.forEach((peer) => {
          const currentHistory = newHistory[peer.id] || [];
          newHistory[peer.id] = [...currentHistory.slice(-8), peer.tx];
        });
        return newHistory;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [peers]);


  const addMutation = useMutation({
    mutationFn: async (formData: { peer_name: string; ip: string }) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to add peer.');
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success('Peer added successfully!');
      setIsOpen(false);
      setDeviceName('');
      setIpAddress('');
      setIsAutoIP(false);
      setIsEditMode(false);
      setSelectedPeer(null);
      await queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add peer.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: { peer_name: string; ip: string }) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${selectedPeer?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update peer.');
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success('Peer updated successfully!');
      setIsOpen(false);
      setDeviceName('');
      setIpAddress('');
      setIsAutoIP(false);
      setIsEditMode(false);
      setSelectedPeer(null);
      await queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update peer.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (peerId: string) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${peerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete peer.');
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success('Peer deleted successfully!');
      await queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete peer.');
    },
  });

  const PeerPause = useMutation({
    mutationFn: async (peerId: string) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${peerId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      })
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete peer.');
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success("Peer Paused Successfully")
      await queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to pause peer.');
    }
  })


  const PeerUnPause = useMutation({
    mutationFn: async (peerId: string) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${peerId}/unpause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      })
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete peer.');
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success("Peer UnPaused Successfully")
      await queryClient.invalidateQueries({ queryKey: ['peers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to Unpause peer.');
    }
  })

  const handlePause = (peer: PeersData) => {
    const isOnline = peerStatus(Number(peer.latest_handshake));
    if (isOnline) {
      PeerPause.mutate(peer.id);
    } else {
      PeerUnPause.mutate(peer.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      toast.error('Device Name is required.');
      return;
    }
    const formData = {
      peer_name: deviceName,
      ip: isAutoIP ? '' : ipAddress,
    };
    if (isEditMode && selectedPeer) {
      updateMutation.mutate(formData);
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (peer: PeersData) => {
    setSelectedPeer(peer);
    setDeviceName(peer.peer_name);
    setIpAddress(peer.assigned_ip);
    setIsAutoIP(peer.assigned_ip === '');
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPeer) {
      deleteMutation.mutate(selectedPeer.id);
      setIsDeleteModalOpen(false);
      setSelectedPeer(null);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setDeviceName('');
    setIpAddress('');
    setIsAutoIP(false);
    setIsEditMode(false);
    setSelectedPeer(null);
  };

  const toggleUsername = (username: string) => {
    setExpandedUsernames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
  };

  const uniqueUsernames = user?.role === 'admin'
    ? Array.from(new Set(peers.map((peer) => peer.username || peer.user_id)))
    : [];

  return (
    <div className="mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Peers</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            setIsEditMode(false);
            setSelectedPeer(null);
            setDeviceName('');
            setIpAddress('');
            setIsAutoIP(false);
            setIsOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Peer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </header>
      {isLoading ? (
        <div className="text-center mt-10">Loading...</div>
      ) : error ? (
        <div className="text-center mt-10 text-red-500">{(error as Error).message}</div>
      ) : peers.length === 0 ? (
        <div className="text-center mt-10">No peers available.</div>
      ) : user?.role === 'admin' ? (
        <div className="p-2 w-full grid gap-4">
          {uniqueUsernames.map((username) => (
            <Collapsible key={username}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-2 bg-muted rounded-t-lg">
                  <h2 className="text-lg font-semibold">{username}</h2>
                  <Button variant="ghost" size="sm" onClick={() => toggleUsername(username)}>
                    {expandedUsernames.has(username) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {expandedUsernames.has(username) ? 'Hide Peers' : 'Show Peers'}
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="w-full grid gap-4 p-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {peers
                    .filter((peer) => (peer.username || peer.user_id) === username)
                    .sort((a, b) => Number(!peerStatus(Number(a.latest_handshake))) - Number(!peerStatus(Number(b.latest_handshake))))
                    .map((peer) => (
                      <PeerCard
                        key={peer.id}
                        peer={peer}
                        onDelete={(p) => {
                          setSelectedPeer(p);
                          setIsDeleteModalOpen(true);
                        }}
                        onEdit={handleEdit}
                        onPause={handlePause}
                        rxHistory={rxHistory[peer.id] || []}
                        txHistory={txHistory[peer.id] || []}
                      />
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="w-full grid gap-4 p-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {peers
            .filter((peer) => peer.user_id === user?.id)
            .sort((a, b) => Number(!peerStatus(Number(a.latest_handshake))) - Number(!peerStatus(Number(b.latest_handshake))))
            .map((peer) => (
              <PeerCard
          key={peer.id}
          peer={peer}
          onDelete={(p) => {
            setSelectedPeer(p);
            setIsDeleteModalOpen(true);
          }}
          onEdit={handleEdit}
          onPause={handlePause}
          rxHistory={rxHistory[peer.id] || []}
          txHistory={txHistory[peer.id] || []}
              />
            ))}
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Peer' : 'Add Peer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deviceName" className="text-right">Device Name</Label>
                <Input
                  id="deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Device Name"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="autoIP" className="text-right">Auto Assign IP</Label>
                <Switch
                  id="autoIP"
                  checked={isAutoIP}
                  onCheckedChange={setIsAutoIP}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ipAddress" className="text-right">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="IP Address"
                  disabled={isAutoIP}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addMutation.status === 'pending' || updateMutation.status === 'pending'}>
                {addMutation.status === 'pending' || updateMutation.status === 'pending' ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCloseModal} disabled={addMutation.status === 'pending' || updateMutation.status === 'pending'}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPeer(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
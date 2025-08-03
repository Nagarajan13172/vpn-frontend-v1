import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base_path } from "@/api/api";
import { getAuthToken } from "@/api/getAuthToken";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Plus, Wifi, WifiOff, ArrowUp, ArrowDown, BookOpenCheck, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatDataSize, formatTimeAgo, peerStatus } from "@/utils/Formater";
import { useBreadcrumb } from "@/components/breadcrumb/BreadcrumbContext";

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

const PeerCard = ({ peer, onDelete, onEdit, rxHistory, txHistory }: {
  peer: PeersData;
  onDelete: (peer: PeersData) => void;
  onEdit: (peer: PeersData) => void;
  rxHistory: number[];
  txHistory: number[];
}) => {
  const navigate = useNavigate();
  const labels = Array(rxHistory.length || 1).fill("");
  const rxChartData = {
    labels,
    datasets: [
      {
        label: "RX",
        data: rxHistory.length ? rxHistory : [peer.rx],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
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
        label: "TX",
        data: txHistory.length ? txHistory : [peer.tx],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
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
      duration: 500,
      easing: "easeOutQuad" as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "nearest" as const,
        intersect: false,
        callbacks: {
          label: (tooltipItem: import("chart.js").TooltipItem<"line">) => `${tooltipItem.dataset.label}: ${formatDataSize(Number(tooltipItem.raw))}`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <Card className="flex flex-col ">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{peer.peer_name}</CardTitle>
            <CardDescription className="text-sm">{formatTimeAgo(peer.latest_handshake)}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={peerStatus(Number(peer.latest_handshake)) ? "default" : "destructive"} className="flex items-center gap-1.5">
              {peerStatus(Number(peer.latest_handshake)) ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {peerStatus(Number(peer.latest_handshake)) ? "Online" : "Offline"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/peers/${peer.id}`); }}>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(peer); }}>Edit</DropdownMenuItem>
                <DropdownMenuItem>Disconnect</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(peer)}>
                  Remove Peer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">IP Address:</span>
            <span
              className="font-mono cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(peer.assigned_ip).then(() => toast.success("IP Address copied to clipboard"));
              }}
            >
              {peer.assigned_ip}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Endpoint:</span>
            <span
              className="font-mono cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                const endpointWithoutPort = peer.endpoint?.split(":")[0] || "(none)";
                navigator.clipboard.writeText(endpointWithoutPort).then(() => toast.success("Endpoint copied to clipboard"));
              }}
            >
              {peer.endpoint?.split(":")[0] || "(none)"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="w-full flex flex-col">
        <div className="w-full flex justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-muted-foreground">Upload</div>
              <div className="font-semibold">{formatDataSize(peer.rx)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-muted-foreground">Download</div>
              <div className="font-semibold">{formatDataSize(peer.tx)}</div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between mt-4">
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

export default function UserPeerView() {
  const { id, username } = useParams<{ id: string; username: string }>();
  const queryClient = useQueryClient();
  const { setBreadcrumbs } = useBreadcrumb();

  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeersData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [isAutoIP, setIsAutoIP] = useState(false);
  const [rxHistory, setRxHistory] = useState<{ [key: string]: number[] }>({});
  const [txHistory, setTxHistory] = useState<{ [key: string]: number[] }>({});

  // Breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      {
        label: (
          <div className="flex items-center gap-1">
            <BookOpenCheck className="h-4 w-4" />
            Users
          </div>
        ),
        href: "/users",
      },
      {
        label: `${username}-Peers`,
        href: `/users/${id}/${username}`,
      },
    ]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs, id, username]);

  // Fetch Peers List for specific user
  const { data: peers = [], isLoading, error } = useQuery<PeersData[]>({
    queryKey: ["peers", id],
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const response = await fetch(`${base_path}/api/peers/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch peers.");
      }
      return response.json();
    },
    refetchInterval: 1000,
    retry: 3,
    enabled: !!id,
  });

  // Update RX and TX history
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

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (formData: { peer_name: string; ip: string }) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to add peer.");
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success("Peer added successfully!");
      setIsOpen(false);
      setDeviceName("");
      setIpAddress("");
      setIsAutoIP(false);
      setIsEditMode(false);
      setSelectedPeer(null);
      await queryClient.invalidateQueries({ queryKey: ["peers"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add peer.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: { peer_name: string; ip: string }) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${selectedPeer?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update peer.");
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success("Peer updated successfully!");
      setIsOpen(false);
      setDeviceName("");
      setIpAddress("");
      setIsAutoIP(false);
      setIsEditMode(false);
      setSelectedPeer(null);
      await queryClient.invalidateQueries({ queryKey: ["peers"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update peer.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (peerId: string) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/peers/${peerId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete peer.");
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success("Peer deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["peers"] });
      setIsDeleteModalOpen(false);
      setSelectedPeer(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete peer.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      toast.error("Device Name is required.");
      return;
    }
    const formData = {
      peer_name: deviceName,
      ip: isAutoIP ? "" : ipAddress,
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
    setIsAutoIP(peer.assigned_ip === "");
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPeer) {
      deleteMutation.mutate(selectedPeer.id);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setDeviceName("");
    setIpAddress("");
    setIsAutoIP(false);
    setIsEditMode(false);
    setSelectedPeer(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold capitalize">{username}-Peers</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isOpen} onOpenChange={handleCloseModal}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedPeer(null);
                  setDeviceName("");
                  setIpAddress("");
                  setIsAutoIP(false);
                  setIsOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Peer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Peer" : "Add Peer"}</DialogTitle>
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
                  <Button
                    type="submit"
                    disabled={addMutation.status === "pending" || updateMutation.status === "pending"}
                  >
                    {addMutation.status === "pending" || updateMutation.status === "pending" ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={addMutation.status === "pending" || updateMutation.status === "pending"}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </header>

      {/* Peers List */}
      {isLoading ? (
        <div className="text-center mt-10">Loading...</div>
      ) : error ? (
        <div className="text-center mt-10 text-red-500">{(error as Error).message}</div>
      ) : peers.length === 0 ? (
        <div className="text-center mt-10">No peers available for {username}.</div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 p-2">
          {peers.map((peer) => (
            <PeerCard
              key={peer.id}
              peer={peer}
              onDelete={(p) => {
                setSelectedPeer(p);
                setIsDeleteModalOpen(true);
              }}
              onEdit={handleEdit}
              rxHistory={rxHistory[peer.id] || []}
              txHistory={txHistory[peer.id] || []}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
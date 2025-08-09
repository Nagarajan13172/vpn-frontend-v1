"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { getAuthToken } from "@/api/getAuthToken";
import { base_path } from "@/api/api";
import { toast } from "sonner";
import { PeerCard, type PeersData } from "../peer/Peer";

export default function Finder() {
  const [searchIp, setSearchIp] = useState("");
  const [foundPeers, setFoundPeers] = useState<PeersData[]>([]);
  const [rxHistory, setRxHistory] = useState<{ [peerId: string]: number[] }>({});
  const [txHistory, setTxHistory] = useState<{ [peerId: string]: number[] }>({});

  const searchMutation = useMutation({
    mutationFn: async (ips: string[]) => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const response = await fetch(`${base_path}/api/peers/peers/by-ips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(ips), // Send array of IPs directly
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to find peers.");
      }
      return response.json();
    },
    onSuccess: (data: PeersData[]) => {
      setFoundPeers(data);
      if (data.length > 0) {
        toast.success(`${data.length} peer${data.length > 1 ? "s" : ""} found successfully!`);
        // Initialize history for found peers
        const newRxHistory: { [peerId: string]: number[] } = {};
        const newTxHistory: { [peerId: string]: number[] } = {};
        data.forEach((peer) => {
          newRxHistory[peer.id] = [peer.rx];
          newTxHistory[peer.id] = [peer.tx];
        });
        setRxHistory(newRxHistory);
        setTxHistory(newTxHistory);
      } else {
        toast.info("No peers found for the provided IP addresses.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to search for peers.");
      setFoundPeers([]);
      setRxHistory({});
      setTxHistory({});
    },
  });

  useEffect(() => {
    if (foundPeers.length === 0) return;

    const interval = setInterval(async () => {
      const authToken = getAuthToken();
      if (!authToken) return;

      try {
        const response = await fetch(`${base_path}/api/peers/peers/by-ips`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(foundPeers.map((peer) => peer.assigned_ip)),
        });
        if (response.ok) {
          const updatedPeers: PeersData[] = await response.json();
          setRxHistory((prev) => {
            const newHistory = { ...prev };
            updatedPeers.forEach((peer) => {
              newHistory[peer.id] = [...(newHistory[peer.id] || []).slice(-59), peer.rx];
            });
            return newHistory;
          });
          setTxHistory((prev) => {
            const newHistory = { ...prev };
            updatedPeers.forEach((peer) => {
              newHistory[peer.id] = [...(newHistory[peer.id] || []).slice(-59), peer.tx];
            });
            return newHistory;
          });
        }
      } catch (error) {
        console.error("Failed to update peer data:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [foundPeers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ipList = searchIp
      .split(",")
      .map((ip) => ip.trim())
      .filter((ip) => ip);
    if (
      ipList.length === 0 ||
      ipList.some((ip) => !ip.match(/^(?:\d{1,3}\.){3}\d{1,3}$/))
    ) {
      toast.error("Please enter valid IPv4 addresses (e.g., 192.168.0.0, 172.16.0.0, 10.0.0.0)");
      return;
    }
    searchMutation.mutate(ipList);
  };

  const handleEdit = () => {
    toast.info("Edit functionality is available in the Peers Dashboard.");
  };

  const handleDelete = () => {
    toast.info("Delete functionality is available in the Peers Dashboard.");
  };

  const handlePause = () => {
    toast.info("Pause/Unpause functionality is available in the Peers Dashboard.");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Peer Finder</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="search"
          placeholder="Enter IPv4 addresses (e.g., 192.168.0.0, 172.16.0.0, 10.0.0.0)"
          title="Enter valid IPv4 addresses separated by commas (e.g., 192.168.0.0, 172.16.0.0, 10.0.0.0)"
          value={searchIp}
          onChange={(e) => setSearchIp(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" disabled={searchMutation.isPending}>
          {searchMutation.isPending ? "Searching..." : "Search"}
        </Button>
      </form>

      {searchMutation.isPending && (
        <div className="text-center mt-10">Loading...</div>
      )}

      {foundPeers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {foundPeers.map((peer) => (
            <PeerCard
              key={peer.id}
              peer={peer}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPause={handlePause}
              rxHistory={rxHistory[peer.id] || []}
              txHistory={txHistory[peer.id] || []}
            />
          ))}
        </div>
      )}

      {!searchMutation.isPending && foundPeers.length === 0 && searchIp && (
        <div className="text-center mt-10 text-gray-500">
          No peers found for the provided IP addresses.
        </div>
      )}
    </div>
  );
}
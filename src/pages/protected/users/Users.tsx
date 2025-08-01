// src/pages/users/index.tsx
import { useState, useEffect } from "react";
import { ClientTable } from "./components/client-table";
import { columns, type VPNUser } from "./components/columns";
import { Button } from "@/components/ui/button";


const UsersPage = () => {
  const [data, setData] = useState<VPNUser[]>([]);

  useEffect(() => {
    // Mock data (replace with API call)
    const mockData: VPNUser[] = [
      {
        id: "1",
        username: "john_doe",
        role: "admin",
        peer: "192.168.1.10",
        createdAt: "2025-01-15T10:00:00Z",
      },
      {
        id: "2",
        username: "jane_smith",
        role: "user",
        peer: "192.168.1.11",
        createdAt: "2025-02-20T12:00:00Z",
      },
      {
        id: "3",
        username: "guest_user",
        role: "guest",
        peer: "192.168.1.12",
        createdAt: "2025-03-10T15:00:00Z",
      },
    ];
    setData(mockData);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">VPN Users</h1>
        <Button variant="outline" className="mb-4">
          Add User
        </Button>
      </div>

      <ClientTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
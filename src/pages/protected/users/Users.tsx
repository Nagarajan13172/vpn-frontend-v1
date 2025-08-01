
import { useState } from "react";
import { ClientTable } from "./components/client-table";
import { columns } from "./components/columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/api/getAuthToken";
import { base_path } from "@/api/api";
import { toast } from "sonner";

interface NewUser {
  username: string;
  password: string;
  role_id: string;
}

const UsersPage = () => {
  const [data, setData] = useState<[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewUser>({
    username: "",
    password: "",
    role_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient(); // ✅ React Query Client for refetching data



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    mutation.mutate({ ...formData });

  };

  //mutation logic to add user
  const mutation = useMutation<NewUser, unknown, typeof formData>({
    mutationFn: async (formData) => {
      const authToken = getAuthToken();
      const response = await fetch(`${base_path}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw (data.detail);
      }
      return response.json();
    },
    onSuccess: async () => {
      toast.success("User added successfully");
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsLoading(false);
      setIsModalOpen(false);
    },

    onError: (error) => {
      toast.error(`Error adding user: ${error}`);
      setIsLoading(false);
    }
  });

  //api for Users Role

  const { data: roleData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) throw new Error("No auth token found");
      const response = await fetch(`${base_path}/api/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData.detail;
      }
      return response.json();
    }
  })

  if(isLoading) {
    return <div>Loading...</div>;
  }



  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">VPN Users</h1>
        <div className="flex gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mb-4">
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={formData.role_id}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(roleData) ? roleData : []).map((role: { id: string; role: string }) => (
                        <SelectItem key={role.id} value={role.role}>
                          {role.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" >
                  Add User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="mb-4">
            Download All
          </Button>
        </div>
      </div>
      <ClientTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
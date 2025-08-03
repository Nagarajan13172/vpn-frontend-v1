// src/pages/users/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useUserColumns } from "./components/columns";
import { ClientTable } from "./components/client-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useBreadcrumb } from "@/components/breadcrumb/BreadcrumbContext";
import { BookA, Pencil, Plus, Trash2Icon } from "lucide-react";
import type { NewUser, Role, User } from "@/types/user";



const UsersPage = () => {

  {
    /* BreadCrumbs */
  }
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      {
        label: (
          <div className="flex items-center gap-1">
            <BookA className="h-4 w-4" />
            Users
          </div>
        ),
        href: "/users",
      },
    ]);

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewUser>({
    username: "",
    password: "",
    role_id: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role_id: value }));
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      role_id: user.role.id,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      editMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (formData: NewUser) => {
      const token = getAuthToken();
      const res = await fetch(`${base_path}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to create user.");
      return res.json();
    },
    onSuccess: async () => {
      toast.success("User created successfully");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const editMutation = useMutation({
    mutationFn: async (formData: NewUser) => {
      const token = getAuthToken();
      const res = await fetch(`${base_path}/api/users/${selectedUser?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update user.");
      return res.json();
    },
    onSuccess: async () => {
      toast.success("User updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setSelectedUser(null);
      setIsEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`${base_path}/api/users/${selectedUser?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to delete user.");
      return res.json();
    },
    onSuccess: async () => {
      toast.success("User deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedUser(null);
      setIsDeleteModalOpen(false);
    },
    onError: (err) => toast.error(`Error deleting user: ${err.message}`),
  });

  const { data: roleData = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`${base_path}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load roles");
      return res.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`${base_path}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const columns = useUserColumns(openEditModal, handleDeleteRequest);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">VPN Users</h1>
        <div className="flex gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                {isEditing ? (
                  <>
                    <Pencil className="w-4 h-4 " />
                    Edit User
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 " />
                    Add User
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium">Username</label>
                  <Input name="username" value={formData.username} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <Input name="password" type="password" value={formData.password} onChange={handleInputChange} required={!isEditing} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <Select value={formData.role_id} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleData.map((role) => (
                        <SelectItem key={role.id} value={role.id}>{role.role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {isEditing ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete user "{selectedUser?.username}"?</p>
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  <>
                  <Trash2Icon />
                  Delete
                  </>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">Download All</Button>
        </div>
      </div>
      <ClientTable columns={columns} data={users} />
    </div>
  );
};

export default UsersPage;

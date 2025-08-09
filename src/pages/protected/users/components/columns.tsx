// src/pages/users/components/columns.tsx
import { ArrowUpDown, Eye, MoreHorizontal, Pause, Pencil, Play, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import type { Role } from "@/types";
import { useNavigate } from "react-router";
import type { User } from "@/types/user";

// Define the column configuration without using hooks directly
const createColumnConfig = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  navigate: (path: string) => void,// Pass navigate as a parameter
  onPauseToggle: (user: User) => void,
): ColumnDef<User>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as Role | undefined;
        return <div>{role?.role || "Unknown"}</div>;
      },
    },
    {
      accessorKey: "peer_count",
      header: "Peer Count",
      cell: ({ row }) => <div>{Number(row.getValue("peer_count"))}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "paused",
      header: "Status",
      cell: ({ row }) => {
        const isPaused = row.getValue("paused") as boolean;
        return <div>{isPaused ? "Paused" : "Active"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/users/${user.id}/${user.username}`)}
              >
                <>
                  <Eye />
                  View
                </>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(user)}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onPauseToggle(user)}>
                {user.paused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Unpause
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};

// Custom hook to provide columns with navigation
export const useUserColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  onPauseToggle: (user: User) => void
): ColumnDef<User>[] => {
  const navigate = useNavigate();
  return createColumnConfig(onEdit, onDelete, navigate, onPauseToggle);
};
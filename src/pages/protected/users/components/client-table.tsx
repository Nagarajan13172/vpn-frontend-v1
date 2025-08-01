// src/pages/users/client-table.tsx
import { useState } from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./pagination";
// import { DataTableFilter } from "./filter-columns";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/api/getAuthToken";
import { base_path } from "@/api/api";

interface ClientTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
}

// Define user structure based on API response
interface User {
    id: string;
    username: string;
    role: string;
    peer_count: string;
    created_at: string;
}


export function ClientTable({ columns, data }: ClientTableProps<User>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});


    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const authToken = getAuthToken();
            if (!authToken) throw new Error("No auth token found");

            const response = await fetch(`${base_path}/api/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData.detail;
            }

            return response.json();
        }
    });

    // api for users roles
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

            const data = await response.json();
            return Array.isArray(data) ? data : data.role || []; // Adjust based on API structure
        },

    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        meta: { roleData }
    });



    return (
        <div className="space-y-4">
            {/* <DataTableFilter table={table} roleData={roleData} /> */}
            <DataTable columns={columns} data={users} />
            <DataTablePagination table={table} />
        </div>
    );
}
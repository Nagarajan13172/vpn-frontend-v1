
// import { type Table } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Settings2 } from "lucide-react";

// interface DataTableFilterProps<TData> {
//   table: Table<TData>;
//   roleData?: { id: string; role: string }[]; // Optional role data
// }

// export function DataTableFilter<TData>({ table, roleData }: DataTableFilterProps<TData>) {
//   return (
//     <div className="flex items-center py-4 space-x-2">
//       <Input
//         placeholder="Filter usernames..."
//         value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
//         onChange={(event) =>
//           table.getColumn("username")?.setFilterValue(event.target.value)
//         }
//         className="max-w-sm"
//       />
//       {roleData && Array.isArray(roleData) && (
//         <select
//           value={(table.getColumn("role_id")?.getFilterValue() as string) ?? ""}
//           onChange={(event) =>
//             table.getColumn("role_id")?.setFilterValue(event.target.value)
//           }
//           className="border p-2 rounded-md"
//         >
//           <option value="role">All Roles</option>
//           {roleData.map((role) => (
//             <option key={role.id} value={role.role}>
//               {role.role}
//             </option>
//           ))}
//         </select>
//       )}
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="outline" className="ml-auto">
//             <Settings2 className="mr-2 h-4 w-4" />
//             View
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
//           <DropdownMenuSeparator />
//           {table
//             .getAllColumns()
//             .filter((column) => column.getCanHide())
//             .map((column) => (
//               <DropdownMenuCheckboxItem
//                 key={column.id}
//                 className="capitalize"
//                 checked={column.getIsVisible()}
//                 onCheckedChange={(value) => column.toggleVisibility(!!value)}
//               >
//                 {column.id}
//               </DropdownMenuCheckboxItem>
//             ))}
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   );
// }

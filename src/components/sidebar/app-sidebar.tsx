import { Calendar, ChevronUp, Home, Inbox, Search, User2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NavLink } from "react-router";
import logo from "../../../public/logo.png";
import { useUserStore } from "@/global/useUserStore";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Peer",
    url: "/peer",
    icon: Inbox,
  },
  {
    title: "Users",
    url: "/users",
    icon: Inbox,
    adminOnly: true, // Added flag to mark admin-only item
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Calendar,
  },
  {
    title: "Help",
    url: "/help",
    icon: Search,
  },
];

export function AppSidebar() {
  const { user } = useUserStore();
  return (
    <Sidebar collapsible="icon" className="h-screen border-r bg-muted">
      <SidebarHeader>
        <SidebarMenuButton
          asChild
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
              <img src={logo} alt="YoungStorage Logo" className="h-6 w-6" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight data-[state=collapsed]:hidden">
              <span className="truncate font-semibold">YoungStorage</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => !item.adminOnly || (item.adminOnly && user?.role === "admin"))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url}>
                        {({ isActive }) => (
                          <div
                            className={`w-full flex items-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            } data-[state=collapsed]:justify-center data-[state=collapsed]:px-2`}
                          >
                            <item.icon
                              className={`h-5 w-5 shrink-0 ${
                                isActive
                                  ? "text-sidebar-accent-foreground"
                                  : "text-foreground"
                              }`}
                            />
                            <span className="data-[state=collapsed]:hidden">{item.title}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="data-[state=collapsed]:justify-center data-[state=collapsed]:px-2"
                >
                  <User2 className="h-5 w-5 shrink-0" />
                  <span className="data-[state=collapsed]:hidden">{user?.username || "Username"}</span>
                  <ChevronUp className="ml-auto h-4 w-4 data-[state=collapsed]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
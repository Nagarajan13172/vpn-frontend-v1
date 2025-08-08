import { Link, useLocation, useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

import { Separator } from "../ui/separator";
import { determineState } from "./menu-route";
import { useTheme } from "../ThemeProvider/theme-provider";
import { MenuActiveWrapper } from "./MenuActive";
import logo from "../../../public/logo.png"
import { NavUser } from "./nav-user";
import { useUserStore } from "@/global/useUserStore";
import { getAuthToken } from "@/api/getAuthToken";
import { useQuery } from "@tanstack/react-query";
import { base_path } from "@/api/api";
import { Server } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ServerStats, type StatsHistoryPoint } from "./server-stats";


interface SidebarMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PathState {
  currentState: string;
  menuItems: SidebarMenuItem[];
}

interface Stats {
  BlockIO: string;
  CPUPerc: string;
  MemPerc: string;
  MemUsage: string;
  NetIO: string;
  PIDs: string;
}
interface ApiResponse {
  stats: Stats;
}
export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme } = useTheme();
  const { user } = useUserStore()

  const [Pathstate, setPathState] = useState<PathState>(
    () => determineState(pathname, user) ?? { currentState: "", menuItems: [] }
  );

  useEffect(() => {
    setPathState(
      determineState(pathname, user) ?? { currentState: "", menuItems: [] }
    );
  }, [pathname, user]);

  const [statsHistory, setStatsHistory] = useState<StatsHistoryPoint[]>([]);


  const { isMobile, setOpenMobile } = useSidebar();

  const navigate = useNavigate();
  const NavigateRoute = (route: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(route);
  };

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["server-stats"],
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const response = await fetch(`${base_path}/api/roles/labs-monitoring`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch server stats.");
      }
      return response.json();
    },
    refetchInterval: 5000,
    
  });

  useEffect(() => {
    if(data) {
      const { BlockIO, NetIO } = data.stats;
      console.log(NetIO)
        console.log('API Response:', data.stats); // Debug API response
        const parseValue = (valueStr: string): number => {
          if (!valueStr || typeof valueStr !== 'string') return 0;
          // Extract numeric part and handle units
          const cleanValue = valueStr.replace(/[^0-9.]/g, '').trim();
          let value = parseFloat(cleanValue) || 0;
          console.log(`Raw Value String: "${valueStr}", Cleaned: "${cleanValue}", Initial Value: ${value}`);
          // Apply unit conversion
          if (valueStr.toLowerCase().includes('gb')) {
            value *= 1024; // Convert GB to MB
            console.log(`Converted GB to MB: ${value} MB`);
          } else if (valueStr.toLowerCase().includes('kb')) {
            value /= 1024; // Convert KB to MB
            console.log(`Converted KB to MB: ${value} MB`);
          } else {
            console.log(`No unit conversion, assumed MB: ${value} MB`);
          }
          return value;
        };
        // Split and parse, with fallback
        const [blockReadStr, blockWriteStr] = BlockIO.includes(' / ') ? BlockIO.split(' / ').map(s => s.trim()) : [BlockIO, '0'];
        const [netReadStr, netWriteStr] = NetIO.includes(' / ') ? NetIO.split(' / ').map(s => s.trim()) : [NetIO, '0'];
        const newPoint: StatsHistoryPoint = {
          name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rawBlockRead: parseValue(blockReadStr),
          rawBlockWrite: parseValue(blockWriteStr),
          rawNetRead: parseValue(netReadStr),
          rawNetWrite: parseValue(netWriteStr),
        };
        console.log('New Point:', newPoint); // Debug parsed values
        setStatsHistory((prev) => [...prev.slice(-14), newPoint]);
    }
  }, [data])


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar text-sidebar-primary-foreground">
              {theme === "light" ? (
                <img
                  src={logo}
                  alt="YSL-VPN"
                  className="h-8 w-8"
                />
              ) : (
                <img
                  src={logo}
                  alt="YSL-VPN"
                  className="h-8 w-8"
                />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xl font-medium">YSL-VPN </span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarHeader>
      <div className="px-4">
        <Separator />
      </div>
      <SidebarContent className="overflow-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>{Pathstate.currentState}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Pathstate.menuItems.map((item) => {
                const isActive =
                  pathname.split("/").splice(0, 2).join("/") == item.href;
                return (
                  <SidebarMenuItem key={item.href} className="relative">
                    <MenuActiveWrapper keyName={item.label} isActive={isActive}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        onClick={() => NavigateRoute(item.href)}
                        className={`${isActive
                          ? "hover:bg-transparent"
                          : "hover:bg-sidebar-accent/30"
                          }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </MenuActiveWrapper>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="w-full  ">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Server Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading && statsHistory.length === 0 ? (
              <div className="space-y-4 p-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <div className="p-2 text-sm text-destructive">Failed to load stats.</div>
            ) : (
              data && <ServerStats stats={data.stats} history={statsHistory} />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
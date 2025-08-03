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


interface SidebarMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PathState {
  currentState: string;
  menuItems: SidebarMenuItem[];
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


  const { isMobile, setOpenMobile } = useSidebar();

  const navigate = useNavigate();
  const NavigateRoute = (route: string) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate(route);
  };

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

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
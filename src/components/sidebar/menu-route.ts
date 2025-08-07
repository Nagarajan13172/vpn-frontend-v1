import {
    Atom,
    LayoutDashboard,
    Presentation,
    Settings,
    UserPlus,
} from "lucide-react";

export const mainItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Peer", href: "/peers", icon: Atom },
    { label: "Users", href: "/users", icon: UserPlus, },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help", href: "/help", icon: Presentation },
];


export function determineState(path: string, user: { role: string }) {
  const filteredItems = mainItems.filter((item) => {
    if (item.label === "Users" && user.role !== "admin") {
      return false;
    }
    return true;
  });

  for (const item of filteredItems) {
    if (path.startsWith(item.href)) {
      return {
        currentState: "platform",
        menuItems: filteredItems,
      };
    }
  }

  // Fallback state if no path matches
  return {
    currentState: "platform",
    menuItems: filteredItems,
  };
}

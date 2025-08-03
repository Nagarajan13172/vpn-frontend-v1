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


export function determineState(path: string) {
    for (const item of mainItems) {
        if (path.startsWith(item.href)) {
            return {
                currentState: "platform",
                menuItems: mainItems,
            };
        }
    }
}
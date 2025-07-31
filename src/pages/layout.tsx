
import { Outlet } from "react-router";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ModeToggle } from "@/components/ThemeProvider/ModeToggle";

export default function SideMenuLayout() {
    const open = false;

    return (
        <SidebarProvider defaultOpen={open}>
            <AppSidebar />
            <SidebarInset>
                <header
                    className="flex py-2 md:py-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12
        sticky top-0 z-50 bg-background shadow-sm border-b"
                >
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="bg-foreground/50 w-[1px] h-5"
                        />
                        {/* <CustomBreadcrumb /> */}
                    </div>

                    <div className="flex justify-end items-center gap-2 flex-1 px-4">
                        <ModeToggle />
                    </div>
                </header>
                <div className="p-2 md:p-4 w-full overflow-x-hidden">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}